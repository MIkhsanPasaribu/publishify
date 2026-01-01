# LAPORAN PROGRESS FASE 3

## SISTEM REVIEW DAN EDITOR PUBLISHIFY

**Periode Pengembangan**: 09 Januari 2026 - 22 Januari 2026 (14 hari kerja)  
**Metodologi**: ADDIE (Analysis, Design, Development, Implementation, Evaluation)  
**Tim Pengembang**: Fullstack Development Team Publishify  
**Tanggal Penyusunan**: 31 Desember 2025

---

## PART 1: PENDAHULUAN DAN RUANG LINGKUP

### A. PENDAHULUAN

#### A.1 Latar Belakang Fase 3

Setelah berhasil menyelesaikan Fase 1 yang membangun fondasi sistem autentikasi dan manajemen pengguna, serta Fase 2 yang mengimplementasikan sistem manajemen konten dengan fitur CRUD naskah, kategori, dan genre, kami memasuki Fase 3 yang merupakan komponen krusial dalam ekosistem penerbitan digital Publishify: **Sistem Review Editorial dan Dashboard Editor**.

Fase 3 ini menjadi sangat penting karena membangun jembatan antara penulis yang mengajukan naskah dengan proses quality assurance sebelum publikasi. Tanpa sistem review yang terstruktur, tidak ada mekanisme kontrol kualitas yang dapat memastikan bahwa setiap naskah yang diterbitkan memenuhi standar editorial yang telah ditetapkan. Sistem ini juga memberikan feedback konstruktif kepada penulis untuk meningkatkan kualitas karya mereka, sekaligus memfasilitasi kolaborasi antara editor, admin, dan penulis dalam satu workflow yang terintegrasi.

Dalam perjalanan development Fase 3 ini, kami menghadapi tantangan yang lebih kompleks dibandingkan fase-fase sebelumnya. Kompleksitas ini muncul dari kebutuhan untuk merancang workflow review yang melibatkan tiga role berbeda dengan tanggung jawab yang saling terkait namun distinct. Admin harus dapat mengassign review kepada editor yang tepat, editor harus dapat memberikan feedback yang terstruktur dan komprehensif, sementara sistem harus dapat mengakomodasi berbagai skenario seperti revision request, approval, atau rejection. Semua ini harus diimplementasikan dengan user experience yang smooth dan intuitif untuk setiap role.

Fase 3 juga menandai titik di mana sistem Publishify mulai menunjukkan karakteristiknya sebagai platform editorial yang mature. Dengan adanya sistem review, kami tidak hanya menyediakan tempat untuk penulis mengupload naskah, tetapi menciptakan ekosistem yang mendukung peningkatan kualitas konten secara sistematis. Editor mendapatkan tools yang mereka butuhkan untuk melakukan review secara efisien, admin mendapatkan visibility penuh terhadap progress review, dan penulis mendapatkan feedback yang actionable untuk memperbaiki karya mereka.

#### A.2 Pencapaian Fase Sebelumnya

Sebelum memasuki Fase 3, kami telah menyelesaikan dua fase fundamental yang menjadi landasan solid untuk pengembangan sistem review:

**Fase 1: Sistem Autentikasi dan Manajemen Pengguna**

Fase pertama telah berhasil membangun infrastruktur autentikasi yang robust dengan implementasi JSON Web Token untuk session management. Kami mengimplementasikan role-based access control yang membedakan empat jenis user: penulis, editor, percetakan, dan admin. Setiap role memiliki permissions yang berbeda dan terisolasi satu sama lain. Sistem OAuth dengan Google juga telah terintegrasi, memberikan kemudahan bagi user untuk melakukan registrasi dan login tanpa harus mengingat password tambahan.

Database schema untuk user management telah dirancang dengan struktur yang normalized, memisahkan data credentials di tabel pengguna, data profil di tabel profil_pengguna, dan data role di tabel peran_pengguna. Pemisahan ini memberikan flexibility untuk user yang memiliki multiple roles sekaligus. Frontend telah dilengkapi dengan pages registrasi, login, verifikasi email, dan profile management yang responsive untuk berbagai device.

**Fase 2: Sistem Manajemen Konten**

Fase kedua membangun core features untuk pengelolaan naskah dengan workflow status yang comprehensive. Kami mengimplementasikan tujuh status untuk lifecycle naskah: draft, diajukan, dalam_review, perlu_revisi, disetujui, ditolak, dan diterbitkan. Setiap transisi status memiliki validation rules untuk memastikan data integrity.

Sistem kategori dengan struktur hierarchical telah diimplementasi, memungkinkan admin untuk membuat kategori parent dan sub-kategori dengan unlimited depth. Genre diimplementasikan sebagai flat structure yang lebih simple namun powerful untuk filtering. Sistem revision tracking juga telah berfungsi, menyimpan history setiap kali penulis mengupload version baru dari naskah mereka.

Backend API telah dilengkapi dengan empat puluh tujuh endpoints yang covering semua operations untuk CRUD naskah, kategori, genre, dan upload files. Setiap endpoint protected dengan authentication middleware dan role guards. Frontend dashboard untuk penulis telah complete dengan delapan halaman yang mencakup view draft, ajukan naskah, track status, lihat naskah diterbitkan, dan manage pricing.

Sistem upload files telah dioptimasi dengan chunked upload mechanism untuk handle files berukuran besar sampai sepuluh megabyte. Integration dengan Supabase Storage memberikan reliability dan scalability untuk file management. Preview naskah dengan PDF viewer juga telah terintegrasi di frontend.

Dengan fondasi yang solid dari Fase 1 dan Fase 2, kami siap untuk membangun Fase 3 yang memanfaatkan semua komponen yang telah ada. Sistem review akan menggunakan authentication dan authorization dari Fase 1, serta memanfaatkan data naskah dan workflow status dari Fase 2. Integration antar fase ini menunjukkan kematangan arsitektur yang kami rancang sejak awal.

#### A.3 Tujuan dan Deliverables Fase 3

Fase 3 memiliki tujuan utama untuk membangun sistem review editorial yang end-to-end, mulai dari assignment review oleh admin hingga submission feedback oleh editor dan final decision making. Deliverables yang kami targetkan untuk Fase 3 mencakup aspek backend, frontend, testing, dan documentation.

**Backend Deliverables:**

Pertama, kami menargetkan implementasi modul review yang complete dengan tiga tabel database utama: review_naskah untuk main review entity, feedback_review untuk detailed feedback items, dan log_produksi untuk tracking production process di printing phase nanti. Modul review service harus memiliki minimal delapan core methods yang covering semua business logic: tugaskanReview untuk admin assign editor, mulaiReview untuk editor start working, tambahFeedback untuk editor add feedback items, updateFeedback untuk edit feedback, hapusFeedback untuk delete feedback, submitReview untuk editor submit final recommendation, dan adminDecision untuk admin make final call.

Controller endpoints untuk review module harus expose minimal delapan REST API endpoints dengan proper authentication guards dan role permissions. Setiap endpoint harus memiliki comprehensive Swagger documentation yang menjelaskan request body schema, response format, dan possible error codes. Validation menggunakan Zod schema untuk runtime type checking dan class-validator decorators untuk DTO validation.

Database indexes harus ditambahkan untuk optimasi query performance pada kolom yang frequently used untuk filtering dan sorting seperti status review, id editor, dan id naskah. Row Level Security policies juga harus diimplementasi untuk memastikan editor hanya bisa access review yang assigned to them, dan penulis hanya bisa view feedback untuk naskah mereka sendiri.

**Frontend Deliverables:**

Untuk admin interface, kami menargetkan minimal lima halaman baru: dashboard admin dengan overview statistics, halaman antrian review untuk assign editor, halaman monitoring review untuk track progress, halaman hasil review untuk admin decision, dan halaman manage editor untuk CRUD editor accounts. Setiap halaman harus responsive untuk mobile, tablet, dan desktop views.

Dashboard editor merupakan deliverable yang sangat critical karena ini adalah workspace utama untuk editor. Kami menargetkan minimal enam halaman: dashboard editor dengan personal statistics, halaman daftar review dengan tab filters, halaman detail review dengan naskah preview, halaman baca naskah dengan PDF viewer, halaman form feedback dengan dynamic fields, dan halaman riwayat review yang sudah completed.

Component library untuk review-specific UI elements seperti FeedbackCard, ReviewStatusBadge, AssignEditorModal, dan AdminDecisionDialog harus dibuat dengan reusable design. Integration dengan TanStack Query untuk data fetching and caching harus optimal untuk minimize unnecessary API calls dan improve user experience dengan instant loading states.

**Testing Deliverables:**

Unit testing untuk review service methods dengan coverage minimal delapan puluh lima persen. Setiap method harus memiliki test cases untuk happy path dan edge cases. Integration testing untuk API endpoints dengan minimal lima puluh test scenarios covering berbagai kombinasi request parameters dan expected responses. End-to-end testing untuk critical user workflows seperti admin assign review, editor submit feedback, dan admin approve naskah.

Performance testing untuk memastikan API response time tetap di bawah dua ratus miliseconds untuk ninety-five percentile requests. Load testing dengan simulasi seratus concurrent users untuk verify sistem stability. Database query optimization testing untuk identify slow queries dan add proper indexes.

**Documentation Deliverables:**

API documentation harus complete dengan Swagger UI yang dapat diakses di endpoint slash api slash docs. Setiap endpoint harus memiliki description, parameters documentation, request body examples, dan response schema. User guide untuk editor harus dibuat menjelaskan step-by-step cara melakukan review dengan screenshots untuk setiap tahap.

Technical documentation untuk developer harus include database schema diagram dengan relationships, workflow diagram untuk review process, sequence diagram untuk API interactions, dan architecture decision records yang menjelaskan reasoning behind technical choices. Code comments harus comprehensive terutama untuk complex business logic dan edge case handling.

#### A.4 Metodologi Pengembangan

Kami melanjutkan penggunaan metodologi ADDIE yang terbukti efektif di Fase 1 dan Fase 2, dengan adaptasi untuk kompleksitas yang lebih tinggi di Fase 3. Metodologi ini memberikan struktur yang clear untuk development process dan memastikan setiap phase mendapatkan attention yang adequate.

**Analysis Phase (Hari 1-2):**

Phase pertama dimulai dengan deep dive analysis terhadap requirements untuk sistem review. Kami melakukan workshop dengan stakeholders termasuk sample editors untuk memahami workflow mereka dalam melakukan review naskah secara manual. Dari workshop ini, kami mengidentifikasi pain points yang harus diatasi oleh sistem digital seperti kesulitan tracking multiple reviews simultaneously, tidak adanya template untuk consistent feedback format, dan lack of visibility untuk admin terhadap review progress.

Requirements gathering juga melibatkan analysis terhadap sistem review yang sudah ada di platform sejenis untuk identify best practices dan avoid common pitfalls. Kami mereview platform seperti Reedsy, Scribophile, dan Wattpad untuk understand bagaimana mereka handle editorial feedback dan collaboration. Learning dari platform-platform ini membantu kami design user experience yang already familiar untuk users.

Technical analysis dilakukan untuk memastikan existing architecture dapat support new features tanpa major refactoring. Kami review database schema dari Fase 2 untuk identify tables dan columns yang perlu ditambahkan. API design patterns dari Fase 1 dan 2 dijadikan reference untuk maintain consistency.

**Design Phase (Hari 3-4):**

Phase design dimulai dengan database schema design untuk tiga tabel baru yang dibutuhkan sistem review. Entity Relationship Diagram dibuat untuk visualize relationships antar tabel dan identify potential issues seperti circular dependencies atau missing foreign keys. Normalization rules diterapkan untuk minimize data redundancy sambil balance dengan query performance considerations.

API contract design dilakukan dengan define semua endpoints yang akan diexpose, including HTTP methods, URL patterns, request parameters, request body schemas, dan response formats. Mock responses dibuat untuk facilitate parallel development antara frontend dan backend teams. Swagger schema ditulis upfront untuk serve sebagai single source of truth.

UI mockups dibuat menggunakan Figma untuk visualize setiap screen yang akan diimplementasi. Wireframes untuk mobile, tablet, dan desktop views dibuat untuk ensure responsive design. User flow diagrams dibuat untuk map journey dari admin assign review sampai editor submit feedback dan admin make decision. Interactive prototypes dibuat untuk user testing sebelum actual implementation.

**Development Phase (Hari 5-10):**

Phase development mengikuti incremental approach dengan sprint harian yang focused. Hari 5-6 fokus pada backend development dimulai dari database migration untuk add new tables, followed by implementation review service methods satu per satu dengan test-driven development approach. Setiap method ditulis testnya terlebih dahulu sebelum implementation untuk ensure testability.

Hari 7-8 fokus pada backend controller implementation dan API endpoint testing. Postman collections dibuat untuk manual testing semua endpoints dengan various scenarios. Error handling ditambahkan untuk gracefully handle edge cases dan provide meaningful error messages. Logging ditambahkan untuk facilitate debugging dan monitoring.

Hari 9-10 fokus pada frontend implementation dimulai dari admin pages karena admin adalah starting point dari review workflow. Custom hooks dibuat untuk encapsulate data fetching logic dan make components cleaner. Form components dengan validation dibuat menggunakan React Hook Form dan Zod. Dashboard components dengan charts dibuat menggunakan Recharts library.

**Implementation Phase (Hari 11-12):**

Phase implementation melibatkan deployment ke staging environment dan integration testing dengan real data. Database migrations dijalankan di staging database dan seeding scripts diexecute untuk populate initial data. Backend API di-deploy ke Railway dan health checks dilakukan untuk verify semua endpoints accessible. Frontend di-deploy ke Vercel dan smoke testing dilakukan untuk verify critical paths working.

User acceptance testing dilakukan dengan involve sample users dari setiap role. Admin testing fokus pada ease of assigning reviews dan monitoring progress. Editor testing fokus pada intuitiveness dari feedback form dan clarity dari instructions. Feedback dari UAT dicatat dan prioritized untuk fixes sebelum production deployment.

Performance monitoring di-setup menggunakan application performance monitoring tools. Response time metrics, error rates, dan database query performance di-track untuk identify bottlenecks. Load testing dengan Locust atau K6 dilakukan untuk verify sistem dapat handle expected traffic.

**Evaluation Phase (Hari 13-14):**

Phase terakhir adalah evaluation untuk assess deliverables terhadap initial requirements dan identify areas for improvement. Functionality checklist dibuat untuk verify semua planned features telah diimplementasi dan working as expected. Bug tracking dilakukan dan critical bugs di-fix sebelum mark phase as complete.

Code review dilakukan dengan focus pada code quality, maintainability, dan adherence to coding standards. Refactoring dilakukan untuk eliminate code smells dan improve readability. Test coverage di-review dan additional tests ditambahkan untuk critical paths yang coverage-nya masih low.

Documentation review dilakukan untuk ensure completeness dan accuracy. API documentation di-verify untuk make sure semua endpoints documented. User guide di-review untuk clarity dan add missing steps jika ada. Technical documentation di-update dengan latest architecture decisions dan implementation details.

Retrospective meeting dilakukan untuk reflect on what went well dan what could be improved untuk fase berikutnya. Action items dari retrospective dicatat dan akan diaplikasikan di Fase 4 development.

---

### B. RUANG LINGKUP PEKERJAAN

#### B.1 Batasan dan Fokus Fase 3

Fase 3 memiliki scope yang jelas dan terdefinisi dengan baik untuk memastikan development tetap focused dan deliverables dapat dicapai dalam timeline yang ditetapkan. Batasan scope ini penting untuk menghindari scope creep yang dapat menunda project timeline dan mengaburkan prioritas development.

**In Scope untuk Fase 3:**

Implementasi complete review workflow mulai dari admin assign editor sampai admin make final decision merupakan core focus Fase 3. Workflow ini mencakup empat tahap utama: assignment phase dimana admin memilih editor yang tepat dan assign mereka ke naskah yang diajukan, review phase dimana editor membaca naskah dan memberikan structured feedback, recommendation phase dimana editor memberikan final recommendation berupa approve revision atau reject, dan decision phase dimana admin mereview feedback editor dan membuat final call untuk proceed atau tidak.

Database schema untuk review system dengan tiga tabel baru: review_naskah sebagai main entity yang menyimpan metadata review termasuk status dan timestamps, feedback_review sebagai child table yang menyimpan individual feedback items dengan aspek rating dan comments, dan relasi many-to-one antara feedback dengan review. Indexes ditambahkan untuk columns yang frequently queried seperti status id_editor dan id_naskah.

Backend API dengan minimal delapan endpoints untuk review operations mencakup POST slash review untuk admin assign review, GET slash review untuk list reviews dengan filtering, GET slash review slash colon id untuk detail review, PUT slash review slash colon id slash mulai untuk editor start review, POST slash review slash colon id slash feedback untuk add feedback, PUT slash review slash colon id slash feedback slash colon feedbackId untuk update feedback, POST slash review slash colon id slash submit untuk editor submit recommendation, dan POST slash review slash colon id slash keputusan untuk admin decision.

Frontend pages untuk admin dengan focus pada assignment dan monitoring mencakup dashboard admin dengan cards showing total naskah diajukan total review aktif dan total editor available, antrian review page dengan grid cards untuk each naskah yang belum di-assign dengan action button untuk assign editor, monitoring review page dengan table showing all active reviews dengan columns untuk judul naskah editor assigned status progress dan actions, dan hasil review page untuk admin view detailed feedback dan make decision.

Frontend pages untuk editor dengan focus pada review workflow mencakup dashboard editor dengan personal statistics showing reviews assigned dalam proses dan completed, daftar review page dengan cards untuk each assigned review dengan tab filters untuk status, detail review page dengan naskah metadata dan preview file button, form feedback page dengan dynamic fields untuk add multiple feedback items dengan aspek rating dan comment inputs, dan riwayat review page dengan history dari reviews yang sudah completed.

Authentication dan authorization enhancements untuk ensure proper role-based access control untuk review endpoints. Guards ditambahkan untuk verify user memiliki role yang sesuai sebelum allow access ke certain endpoints. Editor hanya bisa access reviews yang assigned to them sementara admin bisa view all reviews. Penulis bisa view feedback untuk naskah mereka sendiri tapi tidak bisa modify atau delete.

**Out of Scope untuk Fase 3:**

Advanced features seperti collaborative review dengan multiple editors reviewing satu naskah simultaneously tidak diimplementasi di Fase 3 karena menambah complexity yang significant. Feature ini dijadwalkan untuk Fase 4 atau future iterations setelah basic review workflow stable dan tested.

Notification system yang comprehensive dengan real-time push notifications belum diimplementasi fully di Fase 3. Email notifications untuk critical events seperti review assigned dan feedback submitted akan use basic implementation dengan Nodemailer tapi real-time in-app notifications dengan WebSocket masih placeholder dan akan fully implemented di Fase 4.

Analytics dan reporting dashboard untuk review metrics seperti average review time editor performance ratings dan bottleneck identification tidak included di Fase 3. Basic metrics seperti total reviews completed akan displayed di dashboard tapi detailed analytics dengan charts dan filters akan dikembangkan di Fase 4 setelah sufficient data terkumpul.

Integration dengan external tools seperti Grammarly API untuk automated grammar checking atau plagiarism detection tools tidak diimplementasi di Fase 3 karena require additional budget untuk API subscriptions dan integration complexity. Features ini menjadi nice-to-have untuk future enhancements.

Mobile native applications untuk iOS dan Android tidak dikembangkan di Fase 3. Frontend web application dibuat responsive untuk support mobile browsers tapi native apps dengan better performance dan offline capabilities dijadwalkan untuk future development setelah web version stable.

#### B.2 Komponen Yang Dikembangkan

Pengembangan Fase 3 dibagi menjadi beberapa komponen major yang each memiliki deliverables dan acceptance criteria yang jelas. Breakdown ini membantu tim untuk track progress dan ensure semua aspects dari review system ter-cover.

**Komponen 1: Backend Review Module**

Komponen ini merupakan foundation dari sistem review yang handle semua business logic dan data persistence. File struktur untuk modul ini organized sebagai berikut:

```
backend/src/modules/review/
├── review.module.ts          // Module definition dengan imports dan exports
├── review.controller.ts      // REST API endpoints dengan decorators
├── review.service.ts         // Business logic dengan 8+ methods
├── dto/
│   ├── tugaskan-review.dto.ts       // DTO untuk assign review
│   ├── tambah-feedback.dto.ts       // DTO untuk add feedback
│   ├── update-feedback.dto.ts       // DTO untuk edit feedback
│   ├── submit-review.dto.ts         // DTO untuk submit recommendation
│   └── filter-review.dto.ts         // DTO untuk filtering queries
└── interfaces/
    └── review-response.interface.ts  // Type definitions untuk responses
```

Review service implementation mencakup delapan core methods dengan detailed business logic dan validation. Lokasi file: `backend/src/modules/review/review.service.ts` (740 lines). Method tugaskanReview handle assignment dari admin dengan validation untuk ensure naskah status adalah diajukan dan editor memiliki role yang sesuai. Method ini juga check untuk prevent duplicate assignment untuk naskah yang sama.

Method mulaiReview untuk editor start working on review dengan update status dari ditugaskan menjadi dalam_proses. Timestamp untuk review start di-record untuk calculate review duration metrics. Method tambahFeedback allow editor untuk add structured feedback dengan validasi untuk ensure rating dalam range satu sampai lima dan comment tidak empty.

Method submitReview handle final submission dari editor dengan validation untuk ensure minimal satu feedback telah diberikan sebelum allow submission. Auto-update status naskah based on editor recommendation: jika setujui maka status naskah berubah ke disetujui jika revisi maka perlu_revisi dan jika tolak maka ditolak.

Controller implementation expose delapan REST API endpoints dengan proper HTTP methods dan role guards. Lokasi file: `backend/src/modules/review/review.controller.ts`. Setiap endpoint decorated dengan Swagger decorators untuk generate OpenAPI documentation automatically. Authentication menggunakan JwtAuthGuard dan authorization menggunakan PeranGuard dengan Peran decorator.

**Komponen 2: Frontend Admin Interface**

Komponen ini provide interface untuk admin untuk manage review assignments dan monitor progress. File struktur organized sebagai berikut:

```
frontend/app/(admin)/admin/
├── antrian-review/
│   └── page.tsx                    // Antrian review untuk assign editor
├── monitoring/
│   └── page.tsx                    // Monitor progress semua reviews
├── review/
│   ├── page.tsx                    // List semua reviews
│   └── [id]/
│       └── page.tsx                // Detail review untuk admin decision
```

Halaman antrian review menampilkan grid cards untuk naskah yang statusnya diajukan dan belum assigned editor. Lokasi file: `frontend/app/(admin)/admin/antrian-review/page.tsx`. Setiap card display cover image judul naskah nama penulis kategori genre badges dan tanggal diajukan. Button Tugaskan ke Editor membuka modal dengan dropdown untuk select editor. Dropdown di-populate dari API GET slash pengguna dengan filter role equals editor dan sort by current workload ascending.

Modal assign editor menggunakan shadcn Dialog component dengan form yang include Select untuk pilih editor dari dropdown dan Textarea untuk optional notes. Submit button call API POST slash review dengan body idNaskah idEditor dan catatan. Success callback invalidate queries untuk refresh list dan show toast notification. Lokasi component: Modal ini inline di page component untuk simplicity tapi bisa di-extract jadi separate component untuk reusability.

Halaman monitoring review display table dengan columns judul naskah penulis editor assigned status progress tanggal assigned dan actions. Lokasi file: `frontend/app/(admin)/admin/monitoring/page.tsx`. Table menggunakan Tanstack Table untuk sorting filtering dan pagination. Status badge color-coded: ditugaskan yellow dalam_proses blue selesai green. Progress column show count feedback items yang sudah submitted.

Action column untuk row dengan status selesai show button Lihat & Putuskan yang navigate ke detail page. Detail review page untuk admin decision display comprehensive view dari naskah metadata editor feedback list dengan ratings dan comments dan editor recommendation. Lokasi file: `frontend/app/(admin)/admin/review/[id]/page.tsx`. Admin dapat review semua feedback kemudian make decision dengan three action buttons: Setujui dengan green color Minta Revisi dengan yellow color dan Tolak dengan red color. Setiap action show confirmation dialog untuk prevent accidental clicks.

**Komponen 3: Frontend Editor Dashboard**

Komponen ini provide workspace untuk editor untuk conduct reviews dan submit feedback. File struktur:

```
frontend/app/(editor)/editor/
├── page.tsx                        // Dashboard editor dengan statistics
├── review/
│   ├── page.tsx                    // Daftar reviews assigned
│   └── [id]/
│       └── page.tsx                // Review detail dengan feedback form
├── naskah/
│   └── [id]/
│       └── page.tsx                // Naskah reader dengan PDF viewer
└── pengaturan/
    └── page.tsx                    // Editor profile settings
```

Dashboard editor display tiga stat cards: Total Ditugaskan showing count reviews dengan status ditugaskan Dalam Proses showing count reviews dengan status dalam_proses dan Total Selesai showing lifetime completed reviews. Lokasi file: `frontend/app/(editor)/editor/page.tsx`. Below stats cards adalah timeline component showing recent five reviews dengan status updates dan timestamps. Quick action cards untuk navigate ke list reviews filtered by status.

Daftar review page display grid cards dengan tab filters untuk All Ditugaskan Dalam Proses dan Selesai. Lokasi file: `frontend/app/(editor)/editor/review/page.tsx`. Each card show naskah cover judul penulis name kategori genre status badge assigned date dan action button. Button label dynamic based on status: Mulai Review untuk ditugaskan Lanjutkan Review untuk dalam_proses dan Lihat Detail untuk selesai.

Detail review page adalah core workspace untuk editor conduct review. Lokasi file: `frontend/app/(editor)/editor/review/[id]/page.tsx`. Page layout split into two columns: left column show naskah metadata dengan preview button dan right column show feedback form. Feedback form allow editor add multiple feedback items dengan fields untuk Aspek dropdown dengan common aspects Rating dengan star rating input dari satu sampai lima dan Komentar dengan textarea for detailed comments.

Array dari feedback items di-manage menggunakan React useState dan displayed as cards below form dengan edit dan delete actions. Button Tambah Feedback add new item ke array. Final submission section at bottom dengan textarea untuk catatan umum dropdown untuk pilih rekomendasi setujui revisi atau tolak dan button Submit Review. Submit show confirmation modal karena action tidak bisa di-undo.

Naskah reader page provide interface untuk baca naskah dalam PDF viewer. Lokasi file: `frontend/app/(editor)/editor/naskah/[id]/page.tsx`. PDF viewer menggunakan react-pdf library dengan features zoom page navigation dan fullscreen mode. Sidebar show table of contents jika available dari PDF structure. Notes panel di side allow editor type temporary notes sementara reading yang auto-saved ke localStorage.

**Komponen 4: API Integration Layer**

Custom hooks dibuat untuk encapsulate API calls dan make components cleaner. File struktur:

```
frontend/lib/api/
└── review.ts                       // Review API client functions

frontend/hooks/
├── use-review.ts                   // Hooks untuk review CRUD operations
├── use-feedback.ts                 // Hooks untuk feedback operations
└── use-assign-review.ts            // Hooks untuk admin assign review
```

Review API client functions export methods untuk call backend endpoints dengan proper error handling dan type safety. Lokasi file: `frontend/lib/api/review.ts`. Functions include assignReview untuk POST review mulaiReview untuk PUT review slash id slash mulai tambahFeedback untuk POST feedback submitReview untuk POST submit dan adminDecision untuk POST keputusan. Each function return typed response dengan interface definitions.

Custom hooks menggunakan TanStack Query untuk data fetching dengan built-in caching dan invalidation. Lokasi file: `frontend/hooks/use-review.ts`. Hook useReviewList untuk fetch list reviews dengan automatic refetch on window focus dan stale time configuration. Hook useReviewDetail untuk fetch single review dengan enabled conditional based on review id presence.

Mutation hooks untuk write operations handle success dan error callbacks. Hook useAssignReview expose mutate function untuk assign review dengan automatic query invalidation untuk review list dan antrian review. Success callback show toast notification dan error callback display error message dengan details dari API response.

#### B.3 Stakeholder dan Role Yang Terlibat

Pengembangan sistem review melibatkan tiga stakeholder utama yang masing-masing memiliki needs dan responsibilities yang berbeda dalam workflow review.

**Admin: Review Assignment Manager**

Admin bertindak sebagai orchestrator dari review process dengan responsibility untuk assign naskah ke editor yang tepat dan make final publishing decisions. Admin needs visibility terhadap semua naskah yang masuk ke system dengan status diajukan untuk dapat prioritize assignment based on factors seperti submission date complexity estimated review time dan editor availability.

Interface yang admin butuhkan include dashboard dengan overview metrics showing backlog dari unassigned manuscripts jumlah active reviews dan editor workload distribution. Tools untuk efficient assignment include editor selection dropdown dengan information tentang current workload specialization areas dan past performance metrics. Bulk assignment feature untuk assign multiple naskah simultaneously akan helpful untuk high-volume periods tapi deprioritized untuk initial implementation.

Admin juga needs interface untuk monitor review progress across all editors untuk identify bottlenecks atau reviews yang stuck. Filtering dan sorting capabilities essential untuk find specific reviews quickly dalam large dataset. Notification system untuk alert admin ketika reviews completed dan waiting for decision critical untuk ensure timely response dan prevent delays dalam publishing pipeline.

Final decision interface must display comprehensive information untuk inform admin decision termasuk all feedback dari editor naskah metadata dan history dari previous revisions jika applicable. Clear action buttons dengan confirmation dialogs prevent accidental decisions. Ability untuk add admin notes yang visible untuk penulis important untuk provide context untuk decisions especially untuk rejections.

**Editor: Content Quality Gatekeeper**

Editor adalah subject matter expert yang responsible untuk assess naskah quality dan provide constructive feedback untuk authors. Editor needs efficient workflow untuk manage multiple reviews simultaneously tanpa losing context atau missing deadlines. Dashboard dengan clear view dari current assignments prioritized by urgency essential untuk effective time management.

Review interface must minimize friction dan allow editor untuk focus on content rather than struggling dengan tools. Quick access untuk open dan read naskah integrated PDF viewer dengan annotation capabilities dan side-by-side layout dengan feedback form ideal untuk efficient workflow. Template atau preset untuk common feedback aspects reduce repetitive typing dan ensure consistency.

Feedback form needs flexibility untuk capture nuanced feedback dengan combination dari structured ratings untuk quantitative assessment dan free-text comments untuk qualitative insights. Auto-save functionality critical untuk prevent loss dari hours dari work karena accidental tab close atau network issues. Draft mode untuk save progress dan come back later without submitting final recommendation important untuk longer reviews.

Editor also needs visibility terhadap their own performance metrics seperti average review time completion rate dan feedback quality ratings dari authors atau admins. Historical data dari past reviews helpful untuk reference previous decisions atau feedback patterns. Recognition system atau leaderboard untuk motivate high-quality reviews dan timely completions dapat improve engagement tapi deprioritized untuk MVP.

**Penulis: Feedback Recipient and Revision Actor**

Meskipun penulis tidak directly interact dengan review interface seperti editor atau admin mereka adalah beneficiary utama dari sistem review yang receive feedback dan act on revisions. Penulis needs clear visibility terhadap status dari naskah mereka dalam review process termasuk who assigned sebagai reviewer dan estimated timeline untuk completion.

Notification system essential untuk keep penulis informed about status changes seperti ketika review assigned ketika editor mulai review dan ketika feedback submitted. Transparency dalam process reduce anxiety dan build trust dalam platform. Ability untuk view feedback segera setelah available tanpa delay important untuk maintain momentum.

Feedback presentation untuk penulis must balance between being comprehensive dan not overwhelming. Grouped feedback by aspects dengan visual ratings easy untuk scan dan identify areas yang need improvement. Detailed comments provide actionable guidance untuk revisions. Differentiation between critical must-fix issues dan nice-to-have suggestions help penulis prioritize revision efforts.

Revision workflow integration allow penulis untuk upload revised version directly dalam context dari feedback tanpa navigate back to main manuscript page. Version comparison tools atau side-by-side diff view helpful untuk track what changed between versions tapi complex untuk implement dan deprioritized untuk initial release.

---

📄 **Lanjut ke**: [PART 2: Progress Pengembangan](./LAPORAN-PROGRESS-FASE-3-PART-2-PROGRESS-PENGEMBANGAN.md)
