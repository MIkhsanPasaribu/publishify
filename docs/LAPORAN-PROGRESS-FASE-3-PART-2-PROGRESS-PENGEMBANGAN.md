# LAPORAN PROGRESS FASE 3

## PART 2: PROGRESS PENGEMBANGAN

---

## C. PROGRESS PENGEMBANGAN

### C.1 Pengembangan Backend Review Module

#### C.1.1 Database Schema Implementation

Tahap pertama dari pengembangan backend dimulai dengan implementasi database schema untuk mendukung sistem review. Kami menambahkan tiga tabel utama yang saling berelasi untuk membentuk struktur data yang robust dan normalized.

**Tabel review_naskah: Main Review Entity**

Tabel ini menjadi core entity yang menyimpan metadata dari setiap assignment review. Lokasi schema definition: `backend/prisma/schema.prisma` lines 368-388. Struktur tabel mencakup id sebagai primary key dengan type UUID untuk ensure uniqueness across distributed systems, id_naskah sebagai foreign key ke tabel naskah dengan constraint cascade delete untuk ensure referential integrity, id_editor sebagai foreign key ke tabel pengguna yang menyimpan siapa editor yang ditugaskan, status dengan enum type StatusReview yang memiliki empat possible values ditugaskan dalam_proses selesai dan dibatalkan, rekomendasi dengan enum type Rekomendasi yang nullable karena only filled setelah editor submit dengan values setujui revisi atau tolak.

Field tambahan include catatan_rekomendasi untuk menyimpan reasoning behind editor recommendation yang essential untuk admin make informed decision, dibuat_pada timestamp untuk track kapan review assigned automatic set dengan default now, diselesaikan_pada timestamp nullable untuk record kapan review completed, dan diperbarui_pada timestamp dengan automatic update untuk track last modification. Indexes ditambahkan pada kolom id_naskah id_editor dan status untuk optimize query performance karena these columns frequently used dalam filtering dan joining operations.

Migration file generated dengan command bun prisma migrate dev dash dash name add_review_tables. Lokasi migration: `backend/prisma/migrations/[timestamp]_add_review_tables/migration.sql`. Migration script create tables dengan proper constraints foreign keys dan indexes. Rollback script juga generated automatically untuk allow reverting changes jika needed. Migration tested di local development database sebelum apply ke staging untuk ensure no breaking changes.

**Tabel feedback_review: Structured Feedback Storage**

Tabel kedua menyimpan individual feedback items yang diberikan editor dengan struktur yang flexible untuk accommodate berbagai aspek penilaian. Lokasi schema: `backend/prisma/schema.prisma` lines 391-401. Design decision untuk separate feedback items into individual rows rather than JSON blob memberikan beberapa advantages: easier untuk query dan filter feedback by specific aspects, better type safety dengan Prisma client generation, dan scalability untuk add more fields di future tanpa schema migration.

Struktur tabel include id sebagai primary key UUID, id_review sebagai foreign key ke review_naskah dengan cascade delete untuk ensure orphan records tidak exist, aspek sebagai varchar untuk menyimpan nama aspect yang dinilai seperti Plot Karakter Gaya Bahasa atau Tata Bahasa dengan flexibility untuk editor add custom aspects, rating sebagai integer dengan constraint check untuk ensure value between satu dan lima providing quantitative assessment, komentar sebagai text type untuk detailed qualitative feedback dengan no length limit untuk accommodate comprehensive comments.

Index pada id_review column essential karena majority queries akan fetch all feedback untuk specific review. Composite index pada aspek dan rating considered untuk enable analytics queries tapi deprioritized untuk initial implementation karena adds overhead untuk insert operations. Foreign key constraint dengan cascade delete ensure ketika review deleted all associated feedback also deleted maintaining data integrity.

**Enum Types untuk Type Safety**

Kami memanfaatkan PostgreSQL enum types untuk enforce valid values at database level dan Prisma enum mapping untuk generate TypeScript types automatically. Lokasi definitions: `backend/prisma/schema.prisma` lines 16-38 untuk enum declarations.

Enum StatusReview dengan empat values mencerminkan lifecycle dari review assignment. Value ditugaskan indicate review baru assigned tapi editor belum start, dalam_proses indicate editor actively working on review, selesai indicate editor sudah submit final recommendation, dan dibatalkan indicate review cancelled by admin atau system karena certain conditions seperti naskah withdrawn oleh penulis. Enum mapping di Prisma schema dengan at at map directive ensure database column names match dengan TypeScript enum names.

Enum Rekomendasi dengan tiga values represent possible outcomes dari editor assessment. Value setujui indicate editor recommend naskah untuk dipublikasi tanpa major revisions, revisi indicate naskah punya potential tapi need improvements sebelum publishing, dan tolak indicate naskah tidak meet quality standards dan should not published. Clear separation dari these outcomes facilitate downstream processing seperti automatic status updates untuk naskah.

Database constraints dan validation rules juga implemented at Prisma level untuk provide additional safety layer. Required fields marked dengan question mark for nullable versus no marking untuk required. Default values specified untuk fields like status yang always start dengan ditugaskan. Timestamps fields utilize now function untuk automatic population. All these rules codified in schema ensure data consistency across application.

#### C.1.2 Review Service Implementation

Review service merupakan jantung dari business logic untuk sistem review dengan delapan core methods yang handle berbagai operations. Lokasi file: `backend/src/modules/review/review.service.ts` dengan total tujuh ratus empat puluh lines dari carefully crafted logic.

**Method tugaskanReview: Admin Assignment Logic**

Method pertama handle assignment dari review kepada editor dengan comprehensive validation untuk ensure data integrity. Implementasi dimulai dengan parallel validation menggunakan Promise.all untuk fetch naskah dan editor data simultaneously improving performance dibanding sequential queries. Naskah validation check ensure manuscript exists dan statusnya diajukan karena only submitted manuscripts eligible untuk review. Status check critical untuk prevent invalid state transitions.

Editor validation lebih complex karena need verify not only user exists tapi also has active editor role. Query include peran_pengguna relation dengan filter untuk jenisPeran equals editor dan aktif equals true. Check untuk existing active review untuk same naskah implemented untuk prevent duplicate assignments yang can cause conflicts. Conflict exception thrown dengan descriptive message jika duplicate detected guiding admin untuk proper action.

Transaction wrapping ensure atomicity dari multiple database operations. Inside transaction kami create review record dengan status ditugaskan kemudian update naskah status ke dalam_review reflecting new state. Log activity record created untuk audit trail capturing who assigned review to whom dan when. Email notification queued untuk inform editor about new assignment dengan details dan link untuk access review interface. Transaction rollback automatically jika any operation fails ensuring no partial updates leave database in inconsistent state.

Response structure follow standardized API response format dengan sukses boolean pesan string dan data object containing created review dengan includes untuk naskah dan editor details. Includes optimize frontend rendering by reducing need untuk additional API calls untuk fetch related data. Error handling comprehensive dengan specific exception types untuk different failure scenarios enabling frontend untuk display appropriate messages untuk users.

**Method mulaiReview: Start Review Workflow**

Method kedua allow editor untuk mark review as started transitioning status dari ditugaskan ke dalam_proses. Design decision untuk require explicit start action rather than automatic transition ketika editor first access review provide better tracking dari actual work time dan commitment dari editor. Method signature accept review id dan editor id sebagai parameters dengan validation untuk ensure editor authorized untuk start this specific review.

Validation logic first fetch review dengan unique where clause kemudian check current status must be ditugaskan untuk allow transition. Forbidden exception thrown jika editor trying untuk start review yang not assigned untuk them preventing unauthorized access. Bad request exception thrown jika review already started or completed preventing duplicate start actions that can confuse state tracking.

Update operation change status ke dalam_proses dan set timestamp untuk mulai_review jika field exists in schema tracking when work actually began. This timestamp useful untuk calculate review duration metrics dan identify reviews yang take longer than expected. Activity log created with action start_review untuk audit purposes. Response include updated review object dengan fresh data untuk frontend refresh displayed information immediately.

Design consideration untuk allow pause dan resume functionality discussed tapi decided untuk keep simple untuk MVP. Editor can navigate away dan come back later tanpa explicit pause action. Status remain dalam_proses until explicit submission. Future enhancement can add more granular states like paused atau suspended jika needed based on user feedback.

**Method tambahFeedback: Add Structured Feedback**

Method ketiga enable editor untuk add individual feedback items dengan structured format ensuring consistency dan completeness. Multiple feedbacks can added untuk single review allowing editor untuk assess different aspects independently. Method accept review id dan feedback DTO containing aspek rating dan komentar fields.

Validation include checking review exists dan belongs untuk requesting editor maintaining security. Review status must be dalam_proses untuk allow adding feedback enforcing proper workflow sequence. Rating validation ensure value between satu dan lima using class-validator decorators di DTO level tapi additional check di service level untuk defense in depth. Empty comment check implemented dengan string trim untuk prevent whitespace-only submissions.

Create operation insert new feedback record linked dengan review id. No explicit ordering field needed karena creation timestamp sufficient untuk display feedback in chronological order. Response include newly created feedback object dengan auto-generated id allowing frontend untuk update UI optimistically atau pessimistically based on design choice.

Auto-save functionality consideration led untuk decision untuk make each add feedback operation immediately persist rather than batch save. This approach trade off some performance untuk better reliability preventing data loss jika editor accidentally close tab sebelum explicit save. Frontend can implement debounced auto-save calling this endpoint periodically untuk draft feedback providing best dari both worlds.

**Method updateFeedback: Edit Existing Feedback**

Method keempat allow editor untuk modify feedback yang already submitted providing flexibility untuk correct mistakes atau add more details setelah further reflection. Method accept review id feedback id dan update DTO containing fields yang want changed. Partial update supported meaning only provided fields updated leaving others unchanged.

Security validation ensure feedback belongs untuk review dan review assigned untuk requesting editor preventing cross-review tampering. Status check allow updates only untuk reviews yang still dalam_proses preventing modifications setelah final submission ensuring integrity dari submitted reviews. Forbidden exception thrown untuk unauthorized attempts.

Update operation use Prisma update method dengan where clause untuk feedback id dan data object containing changes. Timestamp for diperbarui_pada automatically updated by Prisma due untuk updatedAt decorator in schema. Versioning atau history tracking for feedback changes not implemented in MVP tapi can be added later dengan separate feedback_history table jika needed untuk compliance atau audit requirements.

Response structure same as add feedback including updated feedback object. Frontend can optimistically update UI immediately on submit then reconcile dengan actual response or pessimistically wait untuk response before updating reducing perceived latency for users.

**Method hapusFeedback: Delete Feedback Items**

Method kelima provide ability untuk editor untuk remove feedback items yang no longer relevant atau added by mistake. Soft delete versus hard delete decision made in favor dari hard delete untuk MVP karena simpler implementation dan no immediate requirement untuk retention dari deleted feedback. Future audit requirements can necessitate change untuk soft delete approach.

Validation similar dengan update feedback ensuring ownership dan proper review status. Delete operation use Prisma delete method dengan where clause untuk feedback id. Cascade deletes not concern here karena feedback adalah leaf node in relationship tree dengan no dependent records. Success response return confirmation message tanpa data payload karena resource no longer exists.

Edge case handling include checking jika feedback id valid dan exists before attempting delete preventing unnecessary error logs. Not found exception thrown dengan descriptive message jika feedback not found. Idempotency not guaranteed meaning multiple delete calls untuk same feedback id will fail on second attempt which acceptable behavior untuk delete operations.

**Method submitReview: Final Submission Workflow**

Method keenam merupakan culmination dari review process dimana editor submit final recommendation setelah all feedback provided. This method most complex karena involve multiple state transitions dan side effects. Method accept review id dan submission DTO containing rekomendasi enum dan catatan_umum string.

Validation ensure minimal one feedback provided before allowing submission enforcing quality standards. Count query on feedback_review table filtered by review id check this condition. Bad request exception thrown dengan message instructing editor untuk add feedback first jika count zero. Review status must be dalam_proses preventing double submission atau submission dari cancelled reviews.

Transaction wrapping critical here karena multiple updates need happen atomically. First review record updated dengan status selesai rekomendasi value dan catatan_umum captured dari DTO. Timestamp diselesaikan_pada set untuk mark completion time. Second naskah status updated based on rekomendasi value: setujui transitions naskah untuk disetujui revisi transitions untuk perlu_revisi dan tolak transitions untuk ditolak. This automatic status update reduce admin burden dan ensure timely progression dari workflow.

Notification triggered untuk inform admin tentang completed review requiring their decision dan untuk inform penulis tentang feedback availability. Email notification implementation use queued jobs untuk prevent blocking main request thread. Push notification stub added untuk future real-time notification implementation. Activity log record created for submission action capturing full context untuk audit trail.

Response include complete review object dengan all related feedback items dan updated naskah status. Frontend can display confirmation screen dengan summary from submission dan guide editor untuk next actions like reviewing other assigned manuscripts atau viewing submission history.

**Method adminDecision: Final Publishing Decision**

Method ketujuh allow admin untuk make final call on manuscripts after reviewing editor feedback dan recommendation. This critical decision point determine whether naskah proceed untuk publishing atau require additional rounds dari review. Method accept review id dan decision DTO containing keputusan enum approve atau reject dan optional admin notes.

Security check ensure only admin role can invoke this method enforced by controller level guards tapi also checked in service untuk defense in depth. Review must be in selesai status dengan rekomendasi already provided by editor. Attempting decision on incomplete review throw bad request exception guiding admin untuk proper workflow.

Transaction encompass updates untuk review record dengan admin decision dan timestamp kemudian naskah status update based on decision. Approve decision when editor recommended setujui transition naskah untuk diterbitkan ready untuk final publishing steps. Reject decision atau admin override dari editor recommendation maintain current status atau transition untuk ditolak based on logic. Notes from admin attached untuk provide context especially important untuk rejections giving penulis understanding dari decision rationale.

Workflow completion trigger cleanup activities like archiving related data atau triggering downstream processes like preparing naskah untuk publication pipeline. Notification sent untuk penulis informing them dari final outcome dengan next steps clearly outlined. Positive decision notification congratulatory dengan instructions untuk proceed whereas rejection notification empathetic dengan encouragement untuk revise dan resubmit.

Audit logging comprehensive capturing admin id decision timestamp editor recommendation untuk comparison dan admin notes untuk full traceability. This data valuable untuk analyzing decision patterns identifying potential biases atau ensuring accountability in editorial process.

**Method ambilDaftarReview: List Reviews dengan Filtering**

Method kedelapan provide flexible querying capabilities untuk fetch reviews dengan various filters dan pagination. This method support different use cases: editor viewing their assigned reviews admin monitoring all reviews atau penulis checking review status untuk their manuscripts. Method accept filter DTO dan pagination parameters.

Filter DTO support multiple criteria: status untuk filter by review state id_editor untuk show specific editor workload id_naskah untuk show reviews untuk particular manuscript dan date ranges untuk temporal filtering. Optional parameters dengan sensible defaults ensure method usable tanpa complex query building from frontend.

Query construction use Prisma where clause building dengan conditional inclusion dari filter criteria. Object spread operator clean way untuk add filters only when provided. Include relations untuk naskah editor dan feedback optimize data retrieval reducing N plus satu query problems. Ordering by created date descending show newest reviews first which intuitive untuk most use cases.

Pagination implementation use cursor based approach rather than offset based for better performance at scale. Cursor value use review id ensuring stable pagination even when new reviews added during browsing. Take parameter specify page size dengan default twenty balancing data freshness with network efficiency. Response include has next page boolean dan next cursor value enabling frontend untuk implement infinite scroll atau traditional pagination.

Response metadata include total count dari matching reviews allowing frontend untuk display metrics like showing ten dari hundred results. Count query separate from main query untuk performance tapi can be optimized dengan window functions jika become bottleneck. Caching consideration untuk frequently accessed data with Redis integration planned untuk future optimization.

#### C.1.3 Review Controller Implementation

Controller layer bertanggung jawab untuk expose service methods as REST API endpoints dengan proper HTTP semantics dan standardized response formats. Lokasi file: `backend/src/modules/review/review.controller.ts` with three hundred fifty-nine lines dari carefully structured endpoint definitions.

**Endpoint Structure dan Organization**

Controller decorated dengan ApiTags decorator untuk group endpoints in Swagger documentation under review section making API documentation easier untuk navigate. ApiBearerAuth decorator indicate all endpoints require JWT authentication token in Authorization header. Base path review specified in Controller decorator meaning all endpoints prefixed dengan slash api slash review.

UseGuards decorator at controller level apply JwtAuthGuard dan PeranGuard untuk all endpoints ensuring consistent security enforcement. Individual endpoints can further restrict access using Peran decorator specifying which roles allowed. This layered approach provide both convenience dari default protection dan flexibility untuk endpoint specific requirements.

**POST slash review slash tugaskan: Assign Review Endpoint**

Endpoint pertama handle assignment dari review dengan comprehensive Swagger documentation. Lokasi: lines 44-68. ApiOperation decorator provide summary dan detailed description visible in Swagger UI helping frontend developers understand endpoint purpose dan usage. ApiResponse decorators specify possible response status codes dengan descriptions: 201 untuk successful creation 400 untuk validation errors 404 untuk naskah atau editor not found dan 409 untuk conflict jika review already exists.

Request body validation use DTO class TugaskanReviewDto decorated dengan class-validator annotations. Validation automatically executed before method invocation thanks untuk global validation pipe configured in main.ts. ValidationPipe transform plain JavaScript object dari HTTP request into DTO class instance enabling validator decorators untuk work. Any validation failure automatically return 400 status dengan detailed error messages listing which fields failed dan why.

Method implementation extract current user id from PenggunaSaatIni decorator which populated by JWT authentication guard after token verification. This id passed untuk service method along dengan request body DTO. Service method return value directly passed as response body leveraging NestJS automatic JSON serialization. HttpCode decorator explicitly set response code untuk 201 Created following REST conventions untuk resource creation endpoints.

Error handling inherited from global exception filter configured in app module. Service layer exceptions like NotFoundException atau BadRequestException automatically caught dan transformed into appropriate HTTP responses dengan consistent error format including status code error message dan timestamp. This centralized error handling ensure consistency across all endpoints reducing boilerplate in controller methods.

**GET slash review: List Reviews Endpoint**

Endpoint kedua provide querying capabilities dengan flexible filtering options. Lokasi: lines 70-95. ApiQuery decorators document available query parameters for filtering: status untuk filter by review state id_editor untuk show specific editor reviews dan id_naskah untuk show reviews untuk particular manuscript. All parameters marked as required false dengan descriptions indicating default behavior when omitted.

Query parameter extraction use NestJS Query decorator dengan individual parameters atau DTO binding for complex filters. Type conversion automatically handled by ValidationPipe with transform enabled converting string query parameters into appropriate types like enums atau UUIDs. This transformation crucial untuk type safety in service layer preventing runtime type errors.

Pagination support through cursor dan take query parameters documented with ApiQuery. Default values specified in decorator making parameters truly optional with sensible fallbacks. Cursor based pagination preferred over offset based for scalability reasons especially important as review data grows over time. Documentation explain cursor value should be review id dari last item in previous page.

Response include metadata object alongside data array providing information useful untuk frontend pagination components like has next page boolean total count dan next cursor value. This metadata structure standardized across all list endpoints in API ensuring consistent frontend implementation patterns. ApiResponse decorator document success response with 200 status dan schema reference untuk type generation tools.

Public decorator not applied meaning endpoint requires authentication enforcing access control. However no specific role restriction meaning any authenticated user can call endpoint. Service layer implement additional authorization checks ensuring editor only see their reviews whereas admin see all reviews. This design balance between keeping controller clean dan enforcing security closer untuk data.

**GET slash review slash colon id: Get Review Detail**

Endpoint ketiga retrieve single review dengan all related data optimized untuk detail views. Lokasi: lines 97-115. ApiParam decorator document path parameter id specifying UUID format expected. Param decorator in method signature extract id value from URL path dan NestJS automatic validation ensure format correctness before method invocation.

Service method fetch review dengan comprehensive includes untuk naskah editor dan all feedback items reducing need untuk additional API calls from frontend. Response structure designed untuk support both admin detail view showing all information dan editor view showing relevant subset. Frontend can selectively display fields based on user role dan context.

Authorization check in service ensure user has permission untuk view requested review. Editor can only view reviews assigned untuk them whereas admin dan penulis dapat view reviews untuk their manuscripts. Attempting access unauthorized review result in ForbiddenException converted untuk 403 HTTP response dengan appropriate error message.

NotFoundExeption thrown if review id not exist in database resulting in 404 response guiding frontend untuk handle gracefully dengan error message atau redirect. Response documented in Swagger dengan schema showing full review object structure including nested relations enabling frontend developers untuk understand available data without inspecting actual responses.

**PUT slash review slash colon id slash mulai: Start Review Endpoint**

Endpoint keempat allow editor untuk begin working on assigned review. Lokasi: lines 117-135. HttpCode decorator specify 200 OK response appropriate for update operations that return updated resource. Peran decorator restrict access untuk editor role only preventing admin atau penulis dari accidentally invoking this action.

No request body needed as action simply transition review status dari ditugaskan untuk dalam_proses capturing timestamp untuk analytics. Path parameter id identify which review untuk start extracted dan validated automatically. Current user id from JWT token ensure only assigned editor can start review maintaining proper access control.

Service method perform status validation ensuring review in correct state untuk transition. Attempting start already started atau completed review result in BadRequestException dengan descriptive message helping editor understand current state. Success response include updated review object dengan new status allowing frontend untuk update UI immediately reflecting change.

Idempotency not guaranteed meaning multiple calls untuk start same review will fail after first call. This acceptable as start action inherently state changing dan repeated attempts likely indicate client error rather than intentional retry. Frontend should disable start button after first click preventing accidental duplicate submissions.

**POST slash review slash colon id slash feedback: Add Feedback**

Endpoint kelima create new feedback item untuk review. Lokasi: lines 137-160. Peran decorator restrict untuk editor role as only editors provide feedback. Request body use TambahFeedbackDto validated untuk ensure aspek not empty rating within range dan komentar present avoiding incomplete feedback submissions.

Multiple invocations allowed untuk add multiple feedback items for different aspects dari manuscript assessment. Each call create separate feedback record linked untuk same review id. No limit enforced on number dari feedback items enabling thorough reviews though frontend can implement reasonable limits untuk UI purposes.

Response include newly created feedback object dengan auto generated id enabling frontend untuk update feedback list immediately without refetching entire review. Created feedback automatically associated dengan review through foreign key relationship no additional linking step required keeping operation simple dan atomic.

Validation errors dari DTO automatically return 400 status dengan field level error messages. Service layer validation ensure review in correct state untuk accept feedback preventing modifications after submission. Timestamp automatically captured for each feedback creation enabling chronological display dan edit history reconstruction if needed in future.

**PUT slash review slash colon id slash feedback slash colon feedback id: Update Feedback**

Endpoint keenam modify existing feedback items. Lokasi: lines 162-186. Two path parameters review id dan feedback id identify specific feedback untuk update. DTO support partial updates meaning only provided fields modified leaving others unchanged giving editor flexibility untuk incremental refinement.

Validation ensure feedback belongs untuk specified review preventing cross review tampering which could occur with naive implementation using only feedback id. Authorization check confirm current user is assigned editor for parent review maintaining security. Review status check allow updates only for in progress reviews preserving integrity dari completed submissions.

Response include updated feedback object with modified fields dan refreshed timestamp. Frontend can optimistically update UI immediately or wait for response confirmation depending on reliability requirements dan UX preferences. Concurrent update handling rely on database transaction isolation preventing lost updates though optimistic locking could be added for additional safety.

Not found exception thrown if either review id atau feedback id invalid providing clear error message untuk frontend untuk display. Bad request exception for invalid status transitions guide editor untuk proper workflow sequence. All error responses follow standardized format ensuring consistent frontend error handling logic.

**DELETE slash review slash colon id slash feedback slash colon feedback id: Delete Feedback**

Endpoint ketujuh remove feedback items. Lokasi: lines 188-208. HttpCode decorator set 204 No Content response appropriate for successful delete operations that don't return data. Validation similar untuk update endpoint ensuring ownership dan proper state before allowing deletion.

Hard delete implementation immediately remove feedback record from database freeing storage dan simplifying queries. No soft delete flag needed in MVP though can be added later for audit requirements. Cascade effects considered to ensure no orphaned records though feedback is leaf node so no cascades needed.

Success response empty body with 204 status following REST conventions untuk delete operations. Frontend should remove deleted feedback from displayed list without refetching entire review optimizing for perceived performance. Error responses with 404 for not found atau 403 for forbidden operations guide proper error handling.

Idempotency not supported as deleting already deleted resource return 404 on subsequent attempts. This acceptable behavior for delete operations as final state same regardless dari number dari attempts. Frontend should disable delete button immediately after click preventing duplicate submissions from impatient users.

**POST slash review slash colon id slash submit: Submit Review Endpoint**

Endpoint kedelapan finalize review with editor recommendation. Lokasi: lines 210-240. Most critical endpoint in review workflow as it transition review untuk completed state triggering downstream effects like naskah status updates dan notifications. Peran decorator restrict untuk editor ensuring only assigned editor can submit their review.

Request body DTO require rekomendasi enum dan optional catatan_umum for additional context. Validation ensure rekomendasi one dari three valid values setujui revisi atau tolak. Notes optional but encouraged for revisi dan tolak recommendations providing penulis dengan actionable guidance for improvements.

Service layer validation ensure at least one feedback item exists before allowing submission enforcing quality standards. Transaction wrapping ensure atomic updates for review status naskah status dan notifications preventing partial failures that could leave system in inconsistent state. Success response comprehensive including updated review dan naskah status changes.

Endpoint trigger multiple side effects: notifications untuk admin dan penulis activity logging for audit trail dan potential downstream processes like automated quality checks atau publication scheduling. All side effects handled asynchronously where possible untuk avoid blocking response dengan queue based job processing for reliability dan retryability.

**POST slash review slash colon id slash keputusan: Admin Decision Endpoint**

Endpoint kesembilan allow admin untuk make final publishing decision. Lokasi: lines 242-270. Peran decorator restrict untuk admin role only as critical decision requiring highest authority level. Request body DTO include keputusan enum approve atau reject dan optional notes for context especially important for rejections.

Service method validate review in completed state dengan editor recommendation already submitted. Admin decision can align dengan atau override editor recommendation providing flexibility for editorial judgment while maintaining accountability through audit logs. Transaction ensure atomic updates for all affected records.

Final decision trigger significant downstream effects: approved naskah proceed untuk publication pipeline rejected naskah returned untuk penulis dengan feedback dan notifications sent untuk all stakeholders. Implementation use event driven architecture with domain events published for other modules untuk react appropriately enabling loose coupling dan extensibility.

Response structure include final review state naskah status dan any additional metadata relevant for frontend untuk display confirmation screen. Success metrics logged for analytics tracking approval rates decision times dan alignment between editor recommendations dan admin decisions informing process improvements.

### C.2 Pengembangan Frontend Admin Interface

#### C.2.1 Dashboard Admin Implementation

Dashboard admin menjadi central hub untuk monitoring dan managing review process with overview metrics dan quick access untuk key workflows. Lokasi file: `frontend/app/(admin)/admin/page.tsx` implementing main dashboard view dengan comprehensive statistics dan action cards.

**Statistics Cards Implementation**

Empat stat cards displayed in grid layout provide at-a-glance view dari review system health. First card show total naskah diajukan yang belum assigned review indicating backlog requiring attention. Data fetched from GET slash naskah endpoint dengan filter status equals diajukan dan count aggregated in frontend atau returned as metadata from backend. Card color coded dengan warning yellow when count exceed threshold prompting admin action.

Second card display total review aktif combining counts dari status ditugaskan dan dalam_proses representing current workload across all editors. This metric help admin assess system capacity dan decide if additional editor assignments needed or if incoming manuscripts should be queued. Trend indicators show increase atau decrease compared untuk previous period providing context for numbers.

Third card show total editor available filtered by aktif status dari peran_pengguna table. This metric essential for assignment decisions as admin need know how many editors have capacity for new reviews. Click on card navigate untuk editor management page where admin can view individual editor workloads dan availability. Integration dengan calendar system planned for future untuk show editor schedules dan leave periods.

Fourth card display average review turnaround time calculated from review creation untuk completion timestamps. This key performance indicator help admin identify bottlenecks dan set realistic expectations for penulis regarding review timelines. Breakdown by editor available in detailed view accessible via card click enabling targeted performance discussions.

**Recent Activity Timeline**

Below stat cards adalah timeline component showing recent ten activities across review system. Activities include review assignments review starts feedback submissions dan final decisions. Each timeline entry show timestamp actor description dan link untuk relevant review or naskah. Real-time updates via WebSocket connection planned for future making dashboard live monitoring tool.

Timeline implementation use custom React component dengan vertical line connecting activity nodes. Icons differ based on activity type providing visual distinction. Timestamps display relative time like two hours ago with tooltip showing absolute time on hover. Scrollable container allow viewing older activities without cluttering main dashboard.

**Quick Action Cards**

Grid dari four action cards provide shortcuts untuk common admin workflows. First card labeled Antrian Review navigate untuk page showing manuscripts waiting for editor assignment. Badge on card show count dari pending manuscripts updated real-time. Hover effect dan clear call to action encourage admin untuk address backlog promptly.

Second card Monitoring Review navigate untuk page tracking progress dari all active reviews. Visual indicators like progress bars atau status badges preview workload distribution. Click through untuk detailed table view dengan filtering dan sorting capabilities enabling targeted monitoring dari specific editors atau manuscripts.

Third card Hasil Review navigate untuk page listing completed reviews requiring admin decision. Badge show count dari reviews waiting for final approval ensuring timely decisions preventing publication delays. Priority flagging for reviews exceed target decision time draw admin attention untuk urgent items.

Fourth card Kelola Editor navigate untuk user management page filtered untuk editor role. Admin can view editor profiles current workload assignment history dan performance metrics. Capability untuk activate deactivate atau adjust editor permissions centralized in this interface streamlining editor onboarding dan offboarding processes.

#### C.2.2 Antrian Review Page Implementation

Halaman antrian review merupakan workspace utama untuk admin assign manuscripts untuk editors dengan interface designed for efficiency dan informed decision making. Lokasi file: `frontend/app/(admin)/admin/antrian-review/page.tsx` implementing assignment workflow with filtering dan editor selection capabilities.

**Manuscript Grid Layout**

Manuscripts displayed in responsive grid dengan cards showing key information for assignment decisions. Each card include cover image thumbnail providing visual recognition, judul naskah as prominent heading linking untuk detail view, penulis name dengan profile link for context, kategori dan genre as colored badges indicating content type, submission date with waiting time calculation highlighting urgency, dan word count atau page count estimates helping judge review effort required.

Grid responsiveness ensure optimal display across devices: single column on mobile dua columns on tablets dan three atau four columns on desktop. Virtualization implemented using react-window library for smooth scrolling even dengan hundreds dari manuscripts preventing performance degradation. Skeleton loaders during initial data fetch provide immediate feedback reducing perceived wait time.

**Filtering dan Sorting Tools**

Toolbar above grid provide filtering dan sorting controls for managing large manuscript lists. Search input with debounced query filter by judul atau penulis name using fuzzy matching untuk accommodate typos. Category dan genre dropdowns populated from backend enable precise filtering untuk find manuscripts matching editor specializations.

Sort dropdown offer options like newest first oldest first longest waiting time dan estimated difficulty based on length atau genre. Default sort by waiting time descending prioritize manuscripts approaching atau exceeding target assignment time. Sort direction toggle switch between ascending dan descending order. Applied filters displayed as dismissible chips below toolbar providing clear visibility into active filters dan easy removal.

**Assign Editor Modal**

Clicking Tugaskan ke Editor button open modal dialog with editor selection interface. Modal header display manuscript judul untuk context. Editor dropdown populated from GET slash pengguna endpoint filtered for active editors dengan current workload displayed next untuk each name helping admin balance assignments.

Editor list sorted by workload ascending surfacing editors with lightest load first. Editor avatars dan specialization badges provide visual cues. Hover tooltip show detailed editor stats like total reviews completed average review time dan current active review count. Search input within dropdown enable quick finding dari specific editors in large teams.

Optional notes textarea allow admin provide context atau instructions untuk editor like priority level special considerations atau specific aspects untuk focus on. Notes included in assignment email dan visible untuk editor in review interface. Character count display below textarea with limit enforced preventing overly lengthy notes.

Submit button disabled until editor selected enforcing required field validation. Loading state during API call prevent duplicate submissions. Success callback close modal show toast notification dan remove assigned manuscript from grid. Error handling display inline error message in modal with retry button for transient failures.

**Bulk Assignment Feature**

Checkbox on each manuscript card enable selection untuk bulk assignment planned for future enhancement. Select all checkbox in toolbar header streamline selecting multiple manuscripts. Selected count displayed in floating action bar with bulk assign button opening modal similar untuk single assignment but dengan multi-select editor dropdown for distributing manuscripts across multiple editors.

Bulk assignment implementation use transaction atau queue for reliability ensuring partial failures properly handled. Progress indicator show how many assignments completed dari total. Success summary display counts dari successful dan failed assignments dengan option untuk retry failed items. This feature significantly improve admin efficiency during high volume periods.

#### C.2.3 Monitoring Review Page Implementation

Halaman monitoring review menyediakan comprehensive oversight dari all active dan completed reviews dengan real-time status tracking dan performance metrics. Lokasi file: `frontend/app/(admin)/admin/monitoring/page.tsx` dengan 475 lines implementing advanced monitoring interface.

**Statistics Dashboard Section**

Top section display four key metrics cards providing quick health check dari review system. First metric show total review aktif aggregating counts dari status ditugaskan dan dalam_proses. This number critical for capacity planning dan workload assessment. Card colored green when under target capacity yellow for approaching capacity dan red for overcapacity triggering admin attention.

Second metric display average turnaround time calculated from review creation untuk completion across all completed reviews in current period. Rolling 30-day window used for relevance avoiding skew from very old data. Comparison dengan previous period shown as percentage change dengan up atau down arrow indicating trend. Target turnaround time configurable in admin settings dengan deviation alerts for reviews exceed threshold.

Third metric show completion rate as percentage dari completed reviews versus total assigned reviews in period. High completion rate indicate efficient review process whereas declining rate may signal editor bottlenecks atau manuscript quality issues requiring investigation. Drill down capability navigate untuk detailed view showing breakdown by editor untuk identify individual performance patterns.

Fourth metric display pending admin decisions count representing reviews completed by editors awaiting final approval atau rejection. This backlog metric ensure admin aware dari their responsibilities preventing publication delays. Aging analysis show how many pending decisions exceed target decision time with direct links untuk decision interface.

**Review List Table**

Main content area display comprehensive table dengan all reviews sorted by most recent first. Table columns include naskah judul as clickable link untuk manuscript detail view, penulis name untuk context, editor assigned dengan avatar dan name linking untuk editor profile, status badge color coded untuk visual recognition ditugaskan as blue dalam_proses as yellow selesai as green dan dibatalkan as gray, tanggal ditugaskan showing assignment date, durasi calculated as days since assignment for active reviews atau total days for completed reviews, dan actions column dengan icon buttons untuk quick access.

Table implementation use TanStack Table library formerly React Table for advanced features like column sorting filtering pagination dan column visibility toggles. Server-side pagination supported for large datasets reducing initial load time dan memory footprint. Virtual scrolling considered tapi table pagination deemed sufficient for MVP given typical review volumes.

**Filtering dan Search Capabilities**

Toolbar above table provide powerful filtering options for finding specific reviews. Status filter dropdown allow selecting single status atau all untuk broad view. Multi-select variant considered for future enhancement enabling filtering for multiple statuses simultaneously. Editor filter dropdown populated with active editors enable viewing specific editor workload untuk performance reviews atau assignment balancing.

Date range picker enable temporal filtering like show reviews assigned in last week atau completed in current month. Preset options like today this week this month provide convenient shortcuts. Custom range selection support arbitrary date windows for detailed historical analysis atau specific reporting periods.

Search input dengan debounced query enable text search across naskah judul penulis name atau editor name. Fuzzy matching tolerate typos improving usability. Search highlight matched text in results providing visual confirmation dari search terms. Combined filters using AND logic narrow results progressively as more filters applied.

**Bulk Actions for Admin Efficiency**

Checkbox in each table row enable selecting multiple reviews for bulk operations. Select all checkbox in header row streamline selecting entire page atau all matching filtered results. Selected count displayed in floating action bar appearing at bottom dari screen when selections exist.

Bulk actions include reassign editor for transferring reviews when editor unavailable, cancel reviews for withdrawn manuscripts, dan export untuk generating reports or data analysis in external tools. Confirmation dialog for destructive actions prevent accidental bulk operations. Progress indicator for long-running bulk operations keep admin informed during processing.

Action execution use queued jobs ensuring reliability dan providing retry mechanisms for failures. Success dan error counts displayed in completion summary dengan detailed logs accessible for troubleshooting. This bulk capability essential during editor staffing changes atau when addressing multiple similar issues discovered during monitoring.

**Real-time Updates via Polling**

Auto-refresh mechanism poll backend every 30 seconds untuk fetch latest data keeping monitoring view current without manual refresh. Polling interval configurable in user preferences balancing freshness with server load. Visual indicator show last refresh time dan countdown untuk next refresh building user confidence in data recency.

WebSocket integration planned for future providing true real-time updates when reviews change state eliminating polling overhead. Event driven updates enable instant notifications when critical events occur like review completions atau SLA breaches. Graceful degradation for unsupported browsers fall back untuk polling ensuring consistent experience.

#### C.2.4 Admin Decision Interface Implementation

Interface keputusan admin merupakan culmination dari review workflow dimana admin make final call on manuscripts based on editor recommendations dan feedback. Lokasi: `frontend/app/(admin)/admin/review/[id]/page.tsx` implementing decision making interface dengan comprehensive information display.

**Review Summary Panel**

Left panel display complete review metadata dan editor assessment providing all information needed for informed decision. Top section show naskah cover image judul dan penulis prominently establishing context. Below are key details like kategori genre submission date dan manuscript statistics including word count dan page count estimates.

Editor section display assigned editor dengan avatar name dan current workload for context. Review timeline show key dates assignment date start date dan completion date illustrating review duration. Status badge indicate current state dengan visual distinction. Notes field show any admin notes from assignment providing additional context.

Recommendation section prominently display editor recommendation setujui revisi atau tolak dalam large colored badge untuk immediate visibility. Editor catatan_umum displayed below providing reasoning behind recommendation. This qualitative assessment critical for admin understanding editor perspective especially when considering override scenarios.

**Feedback Items Display**

Scrollable section list all feedback items provided by editor organized by aspect atau chronologically. Each feedback card show aspek name with icon indicating category like plot karakter atau bahasa, rating displayed as star visualization atau numeric score providing quantitative assessment, komentar text with full editor notes for qualitative details, dan optional attachment links jika editor uploaded reference materials.

Filtering options enable viewing feedback by rating threshold like show only kriteria dengan rating below tiga highlighting problem areas requiring attention. Grouping by aspect consolidate related feedback enabling thematic analysis. Export functionality generate PDF report combining all feedback for sharing dengan penulis atau stakeholders.

Aggregate statistics calculate average rating across all feedback items providing overall quality score. Distribution chart show rating breakdown indicating whether feedback generally positive mixed atau negative. This visual summary complement detailed feedback review enabling quick assessment before deep dive.

**Decision Action Panel**

Right panel contain decision controls dengan two primary actions approve dan reject. Approve button prominently styled in green signal positive action whereas reject button in red indicate negative action. Contextual help text explain implications dari each decision guiding admin through consequences.

Decision form include required catatan field for admin untuk provide reasoning especially important for rejections giving penulis understanding dari outcome. Character counter encourage detailed explanation with minimum length enforced for rejections ensuring adequate justification. Template suggestions offer common rejection reasons as starting points customizable untuk specific manuscript.

Override checkbox appear when admin decision differs from editor recommendation requiring explicit acknowledgment dari override. Justification field become mandatory when override checked ensuring accountability for decisions contra untuk editor assessment. This safeguard prevent casual overrides encouraging alignment or thoughtful disagreement.

Preview pane show draft notification email untuk penulis allowing admin untuk review message before finalizing decision. Email include decision outcome feedback summary dengan attachment dan next steps clearly outlined. Edit capability enable customization dari template untuk add personal touches atau specific guidance.

**Audit Trail dan Activity Log**

Bottom section display complete audit trail for review showing all actions taken dengan timestamps actors dan details. Entries include review assignment editor acceptance atau rejection start review timestamp each feedback addition feedback modifications editor submission dan now admin decision. This comprehensive log essential for accountability dan process review.

Expandable entries show additional details like before dan after values for modifications IP addresses dan user agent strings for security audit. Export functionality generate compliance reports for regulatory requirements atau internal policy enforcement. Retention policy ensure logs preserved per organizational requirements.

### C.3 Pengembangan Frontend Editor Interface

#### C.3.1 Editor Dashboard Implementation

Dashboard editor merupakan personalized workspace providing overview dari editor workload assignments dan performance metrics. Lokasi: `frontend/app/(editor)/editor/page.tsx` implementing editor central hub dengan role-specific features dan quick access untuk review tasks.

**Personal Statistics Cards**

Four stat cards customized for editor perspective provide immediate insight into workload dan productivity. First card show tugas aktif count representing reviews currently assigned dengan status ditugaskan atau dalam_proses. This number help editor prioritize dan manage daily workload. Click through navigate untuk review list filtered for active assignments.

Second card display total selesai count representing lifetime completed reviews showcasing editor contribution dan experience. This metric build sense dari accomplishment dan track progression over time. Comparison untuk team average provide context whether editor above atau below typical productivity.

Third card show rata-rata waktu review calculated from editor historical review durations. This personal metric help editor understand their pace dan identify opportunities for efficiency improvements. Trend indicator show whether recent reviews faster atau slower than historical average providing feedback on performance changes.

Fourth card display upcoming deadline showing soonest review deadline untuk active assignments. Countdown timer create urgency ensuring editor aware dari time-sensitive commitments. Color coding from green untuk comfortable time yellow for approaching deadline dan red for overdue draw attention appropriately.

**Recent Reviews Timeline**

Timeline component show last ten reviews handled by editor dengan status milestones dan outcomes. Each entry display naskah judul submission date completion date final recommendation dan current naskah status after admin decision. Visual indicator distinguish between recommendations followed by admin versus overridden providing feedback on decision alignment.

Filter toggle switch between active reviews only atau include completed reviews for broader historical view. Date range selector narrow timeline untuk specific period enabling focused reflection. Export functionality generate personal performance report for professional development atau portfolio purposes.

**Quick Actions Dashboard Cards**

Grid dari three action cards provide shortcuts untuk common editor workflows. First card Naskah Masuk navigate untuk list dari newly assigned reviews requiring acceptance decision. Badge show count dari pending assignments prompting timely response. Preview thumbnails for pending manuscripts provide visual selection cues.

Second card Review Aktif navigate untuk list dari in-progress reviews where editor already started work. Progress indicators show completion percentage based on feedback items added versus expected. Sorting by deadline ensure most urgent reviews surfaced first preventing missed deadlines.

Third card Riwayat Review navigate untuk archive dari completed reviews enabling editor untuk reference past work atau track outcomes dari their recommendations. Statistics show acceptance rate dari recommendations providing feedback on calibration dengan admin expectations. Learning opportunities identified from overridden decisions help editor refine judgment.

#### C.3.2 Review List Page Implementation

Halaman daftar review menyediakan comprehensive view dari all editor assignments dengan filtering sorting dan quick access untuk review detail. Lokasi: `frontend/app/(editor)/editor/review/page.tsx` implementing assignment management interface.

**Review Cards Grid Layout**

Reviews displayed in responsive card grid dengan each card showing essential information for prioritization. Card header include naskah cover thumbnail providing visual recognition dan status badge indicating current state ditugaskan dalam_proses atau selesai. Judul naskah displayed prominently as clickable link untuk review detail.

Card body show penulis name submission date assignment date estimated reading time based on word count dan optional deadline jika admin set priority. Footer actions include primary button Mulai Review for ditugaskan status atau Lanjutkan Review for dalam_proses status navigating untuk detail page. Secondary button Lihat Naskah open manuscript preview in new tab untuk quick reference.

Grid responsiveness adapt untuk device width single column on mobile two columns on tablets three columns on desktop. Card height uniform using line clamping untuk long titles maintaining clean grid alignment. Skeleton loaders during fetch provide immediate feedback preventing blank screen perception.

**Filtering dan Sorting Controls**

Toolbar provide controls for managing review list. Status filter tabs as horizontal pills enable quick switching between All Ditugaskan Dalam Proses dan Selesai views. Active tab highlighted with distinct styling. Count badges on tabs show how many reviews in each status providing workload visibility.

Sort dropdown offer options like newest first oldest first shortest reading time longest reading time dan closest deadline. Sort criteria persist in local storage remembering editor preference across sessions. Sort direction toggle between ascending dan descending order.

Search input filter by naskah judul atau penulis name using client-side filtering for instant results given typical dataset sizes manageable in memory. Debouncing prevent excessive re-renders during rapid typing. Clear button reset search restoring full list.

**Empty States dan Loading States**

When no reviews match filters empty state illustration dengan helpful message guide editor. For new editors dengan no assignments yet welcome message explain assignment process dan encourage patience. For experienced editors dengan all reviews completed congratulatory message acknowledge productivity dan suggest checking for new assignments soon.

Loading state during initial fetch show skeleton cards matching actual card layout preventing layout shift when data loads. Progressive enhancement load critical data first like review metadata followed by supplementary data like naskah details ensuring usable interface quickly.

#### C.3.3 Review Detail dan Feedback Form Implementation

Halaman detail review merupakan core workspace dimana editor conduct manuscript assessment dan provide structured feedback. Lokasi: `frontend/app/(editor)/editor/review/[id]/page.tsx` dengan 831 lines implementing comprehensive review interface dengan feedback form dan recommendation submission.

**Split Layout Design**

Interface menggunakan split screen layout dengan left panel showing manuscript metadata dan right panel containing feedback form. Split adjustable via draggable divider allowing editor untuk customize space allocation based on preference. Responsive behavior collapse untuk single column on mobile dengan tab navigation between metadata dan form.

Left panel sticky positioning maintain visibility during scroll ensuring metadata always accessible for reference. Collapsible sections for different information categories prevent overwhelming initial view while keeping everything accessible. Section headers clickable untuk expand collapse managing information density.

**Manuscript Metadata Display**

Metadata panel show comprehensive naskah information. Cover image at top provide visual anchor. Below are details include judul subJudul jika exists sinopsis excerpt dengan read more expansion kategori dan genre badges penulis information dengan profile link submission date word count page count estimated reading time language indicator dan optional tags atau keywords.

Additional sections show submission history including prior submissions jika resubmission revision notes from penulis jika provided dan attached supplementary materials like author bio research notes atau inspiration sources. All information consolidated in single view eliminating need untuk switching contexts during review.

Quick actions toolbar provide access untuk common utilities. Button Buka PDF opens full manuscript in integrated viewer atau new tab. Button Unduh Naskah download manuscript file for offline reading. Button Kontak Penulis open messaging interface for clarification questions during review though discouraged untuk maintaining review objectivity.

**Feedback Form Structure**

Right panel contain dynamic feedback form enabling editor untuk add multiple feedback items covering different assessment aspects. Form initialized dengan empty state prompting editor untuk Add First Feedback. Each feedback item capture three core elements aspek rating dan komentar providing structured yet flexible assessment format.

Add Feedback button create new feedback item form card with three fields. Aspek field dropdown populated dengan predefined categories like Plot Karakter Dialog Bahasa Setting Pacing Struktur dan Orisinalitas dengan option untuk specify custom aspect for items not fitting standard categories. This balance between structure dan flexibility ensure comprehensive coverage while allowing editor discretion.

Rating field display as interactive star selection untuk five-star scale atau slider for more granular numeric input. Accompanying labels clarify rating meaning like satu star sangat kurang tiga stars cukup lima stars sangat baik. Rating required field enforcing quantitative assessment complementing qualitative comments.

Komentar textarea provide space for detailed feedback supporting rich text formatting untuk emphasis lists dan structure. Character counter encourage substantive comments dengan minimum length guidance. Markdown preview tab show formatted output ensuring editor can review presentation before submission. Auto-save functionality periodically persist draft comments preventing data loss from accidental navigation atau session timeout.

**Feedback Items Management**

Submitted feedback items display as cards above form showing aspek rating dan komentar. Edit button reopen item in form for modifications. Delete button with confirmation dialog remove item jika added in error. Reorder handles enable dragging items untuk logical sequence improving readability for admin review.

Feedback summary section aggregate ratings calculating average score dan displaying distribution. Visual chart like bar graph atau pie chart show rating breakdown across aspects identifying strengths dan weaknesses patterns. This analysis aid editor in forming overall recommendation ensuring consistency between detailed feedback dan final assessment.

**Recommendation Submission Workflow**

Bottom section contain recommendation submission controls available after at least one feedback item added enforcing minimum quality standards. Three large buttons represent possible recommendations Setujui Revisi dan Tolak each dengan icon dan description dari implications.

Selecting recommendation open confirmation dialog dengan summary dari feedback items selected recommendation dan required catatan field for justification. This final review step prevent hasty submissions encouraging thoughtful consideration. Template suggestions for common scenarios streamline note writing while allowing full customization.

Preview pane show how feedback will be presented untuk penulis ensuring clarity dan professionalism. Submit button disabled until all required fields completed. Loading state during submission prevent duplicate submissions from impatient clicks. Success redirect untuk completion confirmation page with options untuk review another manuscript atau return untuk dashboard.

### C.4 Integration Testing dan Deployment

#### C.4.1 API Integration Testing

Integration testing fokus pada ensuring seamless communication between frontend dan backend components dengan proper error handling dan data flow. Test suite mencakup happy path scenarios edge cases dan failure modes building confidence in system reliability.

**Review Assignment Flow Testing**

Test scenarios cover complete assignment workflow dari manuscript submission untuk editor assignment. First test verify admin can successfully assign review dengan valid manuscript dan editor IDs expecting 201 response dengan created review object. Assertions check response structure match expected schema dengan all required fields present dan correct types.

Second test verify validation errors for invalid inputs like non-existent manuscript ID expecting 404 response atau assigning untuk user without editor role expecting 403 response. Error messages checked for clarity ensuring frontend can display helpful guidance untuk users.

Third test verify conflict detection when attempting duplicate assignment untuk same manuscript expecting 409 response. Test cleanup important untuk ensure subsequent test runs not affected by data from previous runs using transaction rollback atau explicit cleanup in teardown hooks.

**Editor Feedback Submission Testing**

Test scenarios validate feedback workflow from starting review untuk submitting final recommendation. Test verify editor can start assigned review transitioning status dari ditugaskan untuk dalam_proses. Add feedback operations tested for valid inputs ensuring feedback persisted dengan correct associations untuk review.

Validation tests ensure empty comments rejected rating values outside valid range rejected dan attempting add feedback untuk unassigned review properly forbidden. Update dan delete feedback operations tested for authorized users only preventing tampering.

Final submission tests verify recommendation captured correctly naskah status updated appropriately dan notifications triggered. Test both aligned scenarios where admin approve editor recommendation dan override scenarios where admin decision differs ensuring system handle both paths correctly.

**End-to-End User Flows**

Comprehensive E2E tests using Playwright atau Cypress simulate complete user journeys dari login through task completion. Admin flow test navigate from dashboard untuk antrian review assign manuscript untuk editor dan verify editor receive notification. Editor flow test login view assigned review start review add multiple feedback items submit recommendation dan verify completion confirmation.

Tests run against staging environment dengan production-like configuration ensuring realistic validation. Visual regression testing capture screenshots comparing dengan baseline images detecting unintended UI changes. Performance monitoring during E2E tests validate page load times API response times within acceptable thresholds.

#### C.4.2 Deployment dan Staging Testing

Deployment process designed for safety dan reliability with staged rollout dan comprehensive validation at each phase. Staging environment replicate production configuration enabling realistic testing before user-facing release.

**Backend Deployment Process**

Backend deployment use Docker containers for consistency across environments. Build process compile TypeScript untuk JavaScript generate Prisma client bundle dependencies dan create optimized production image. Multi-stage Dockerfile minimize image size including only runtime dependencies in final image.

Database migrations run automatically during deployment using Prisma migrate deploy command. Migration execution logged for audit trail with rollback scripts prepared for emergency recovery. Schema changes tested thoroughly in staging ensuring no breaking changes atau data loss risks.

Health check endpoint verify service availability after deployment checking database connectivity Redis connection dan essential service initialization. Load balancer only route traffic untuk healthy instances preventing partial outages. Graceful shutdown handling ensure in-flight requests complete before process termination preventing mid-request failures.

**Frontend Deployment Process**

Frontend deployment use static site generation with Next.js build process. Build optimizations include code splitting for smaller bundle sizes image optimization for faster loads dan static page pre-rendering for improved performance. Build artifacts uploaded untuk CDN ensuring global low-latency access.

Environment variables configure API endpoints feature flags dan third-party integrations. Separate configuration for staging dan production prevent accidental cross-environment issues. Validation script check required environment variables present before deployment preventing runtime configuration errors.

Cache invalidation trigger during deployment ensuring users receive latest version without stale cached content. Progressive rollout strategy incrementally increase traffic untuk new version monitoring error rates dan performance metrics. Rollback capability enable quick reversion jika issues detected post-deployment minimizing user impact.

**User Acceptance Testing**

UAT conducted in staging environment dengan representative users from each role admin editor dan penulis. Test scenarios cover common workflows edge cases dan previously identified pain points. Feedback collected through structured questionnaire dan informal observations during sessions.

Issues discovered during UAT prioritized untuk resolution before production release. Critical bugs block deployment whereas minor issues logged for future sprints. Acceptance criteria verified untuk all features ensuring deliverables meet requirements. Sign-off from stakeholders required before production deployment confirming readiness.

---

📄 **Lanjut ke**: [PART 3: Hasil Sementara](./LAPORAN-PROGRESS-FASE-3-PART-3-HASIL-SEMENTARA.md)
