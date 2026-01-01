# LAPORAN DEVELOPMENT STEP BY STEP FASE 6

## PART 1: PENDAHULUAN & ANALISIS KEBUTUHAN

**Tutorial**: Frontend Optimization, Deployment & Production Readiness  
**Focus**: HOW TO Implement Complete Production System  
**Prerequisite**: Tutorial Fase 5 - Backend Optimization  
**Versi Dokumen**: 1.0.0

---

## A. PENDAHULUAN

### A.1 Latar Belakang Tutorial Fase 6

Setelah menyelesaikan tutorial Development Step by Step Fase lima yang fokus pada backend optimization dengan Redis caching, database indexing, Row Level Security, dan testing infrastructure, kami memasuki fase enam yang melengkapi optimization journey dengan frontend performance, deployment automation, dan production readiness. Tutorial fase lima telah mengajarkan kami bagaimana mengimplementasikan backend optimization yang memberikan performance improvement tiga puluh koma enam kali lipat melalui strategic caching, query optimization yang reduce response time hingga sembilan puluh delapan persen, dan security hardening melalui database-level access control.

Namun demikian, backend yang optimal tidak cukup untuk memberikan user experience yang excellent jika frontend masih slow dalam loading atau deployment process yang manual dan error-prone. User tidak directly melihat backend performance tetapi sangat merasakan frontend loading time, image loading speed, dan overall perceived performance. Research menunjukkan bahwa page load time yang exceed tiga detik dapat menyebabkan bounce rate increase hingga lima puluh tiga persen. Oleh karena itu, frontend optimization menjadi equally important dengan backend optimization untuk ensure overall system performance yang excellent.

Selain optimization, production deployment memerlukan proper containerization untuk ensure consistency across environments, automated CI/CD pipeline untuk eliminate human error dalam deployment process, monitoring infrastructure untuk detect issues proactively, dan comprehensive logging untuk troubleshooting when problems occur. Tutorial ini akan guide step by step bagaimana mengimplementasikan semua component tersebut sehingga sistem Publishify fully production-ready dengan confidence tinggi.

### A.2 Tujuan Tutorial

Tutorial Development Step by Step Fase enam ini memiliki empat tujuan utama yang clear dan actionable untuk memastikan pembaca dapat successfully implement frontend optimization dan deployment automation.

**Tujuan Pertama: Frontend Performance Optimization**. Kami akan mengajarkan bagaimana mengoptimalkan frontend performance untuk achieve Lighthouse score minimal sembilan puluh dari seratus dan Core Web Vitals yang meet "good" thresholds. Optimization mencakup image optimization menggunakan Next.js Image component dengan automatic WebP conversion dan responsive sizing, code splitting strategy untuk reduce initial bundle size minimal lima puluh persen melalui dynamic imports dan route-based splitting, lazy loading implementation untuk defer non-critical components dan improve Time to Interactive, dan SEO optimization dengan proper meta tags, structured data, dan sitemap generation.

**Tujuan Kedua: Docker Containerization**. Kami akan mengajarkan bagaimana containerize aplikasi menggunakan Docker dengan multi-stage builds untuk optimal image size, environment-specific configurations untuk support development, staging, dan production environments, volume management untuk persistent data seperti uploads dan database, dan docker-compose orchestration untuk manage multiple services (backend, frontend, database, Redis) dalam coordinated manner.

**Tujuan Ketiga: CI/CD Pipeline Implementation**. Kami akan mengajarkan bagaimana implement automated deployment pipeline menggunakan GitHub Actions dengan automated testing integration yang run unit tests, integration tests, dan E2E tests sebelum deployment, Docker image building dan publishing ke container registry, staging deployment untuk testing dalam production-like environment, production deployment dengan zero-downtime strategy, dan rollback mechanism untuk quickly revert jika deployment encounter critical issues.

**Tujuan Keempat: Monitoring & Logging Infrastructure**. Kami akan mengajarkan bagaimana setup monitoring dan logging infrastructure dengan Prometheus untuk metrics collection dari application dan infrastructure, Grafana untuk visualization melalui customizable dashboards, logging strategy menggunakan structured logging dengan proper log levels, alerting setup untuk proactive issue detection sebelum impact users significantly, dan performance tracking untuk identify degradation trends early.

### A.3 Ruang Lingkup Tutorial

Tutorial ini cover setengah kedua dari rancangan optimization phase yang complement backend optimization dari tutorial fase lima. Secara spesifik, tutorial ini akan mengajarkan implementation dari enam area utama.

**Area Pertama: Frontend Performance Optimization** mencakup thirty-seven Next.js pages dan components optimization dengan lazy loading implementation, bundle size reduction melalui code splitting dan tree shaking, image optimization dengan conversion ke WebP format dan responsive sizing untuk different devices, font optimization dengan preloading dan subsetting, dan JavaScript execution optimization dengan proper chunking dan async loading strategies. Kami akan show actual implementation di file-file seperti frontend/next.config.ts untuk configuration, frontend/app/layout.tsx untuk global optimizations, dan frontend/components/ untuk component-level optimizations.

**Area Kedua: Docker Containerization** mencakup Dockerfile creation dengan multi-stage builds untuk minimize image size, backend containerization dengan proper Node.js base image dan dependency management, frontend containerization dengan Next.js standalone build untuk optimal performance, docker-compose configuration untuk orchestrate all services dalam coordinated manner, dan environment variable management untuk secure configuration across environments. Implementation files include docker/Dockerfile.backend, docker/Dockerfile.frontend, dan docker-compose.yml di root directory.

**Area Ketiga: CI/CD Pipeline** mencakup GitHub Actions workflow configuration dengan automated testing pipeline, build pipeline untuk create Docker images, deployment pipeline untuk push ke staging dan production, environment-specific configurations untuk handle differences between environments, dan monitoring integration untuk track deployment success rates. Implementation primarily dalam .github/workflows/ci-cd.yml file dengan supporting scripts dalam scripts/ directory.

**Area Keempat: Monitoring Setup** mencakup Prometheus configuration untuk metrics collection dengan custom metrics definition untuk business-specific tracking, Grafana dashboard creation dengan panels untuk system metrics, application metrics, dan business metrics, alert rules configuration untuk proactive notification, dan integration dengan notification channels seperti email dan Slack. Implementation files include monitoring/prometheus.yml, monitoring/grafana/dashboards/, dan monitoring/alerts/rules.yml.

**Area Kelima: Production Deployment** mencakup infrastructure setup dengan load balancer configuration untuk distribute traffic, SSL certificate management dengan automatic renewal, database migration strategy untuk zero-downtime deployments, backup strategy dengan automated daily backups dan retention policy, dan disaster recovery planning untuk handle catastrophic failures. Configuration files include nginx.conf untuk load balancer, deployment scripts dalam scripts/deploy.sh, dan backup scripts dalam scripts/backup.sh.

**Area Keenam: Documentation** mencakup operational runbooks untuk common tasks dan troubleshooting, deployment procedures documentation dengan step-by-step instructions, architecture decision records (ADRs) untuk document important design decisions, API documentation updates untuk reflect production endpoints, dan onboarding documentation untuk new team members. Documentation files primarily dalam docs/ directory dengan specific subdirectories untuk operations/, deployment/, dan architecture/.

**Exclusions**: Tutorial ini tidak cover advanced topics seperti Kubernetes orchestration (menggunakan Docker Swarm instead untuk simplicity), advanced monitoring dengan distributed tracing (focus pada metrics dan logs), dan advanced security topics seperti penetration testing (basic security already covered dalam RLS tutorial). Topics tersebut dapat di-address dalam future phases jika required.

### A.4 Metodologi Tutorial

Tutorial ini follow structured approach yang proven effective dalam teaching complex technical implementations.

**Pendekatan Step-by-Step**: Setiap section dalam tutorial provide detailed step-by-step instructions yang can be followed sequentially. Steps include actual commands untuk run, file paths untuk locate relevant code, dan explanations dari why each step necessary. Format ini ensure bahwa even developers yang relatively new dapat follow along successfully tanpa getting lost.

**Code-First Approach**: Rather than abstract explanations, tutorial ini provide concrete code examples dan actual implementations yang already working dalam Publishify codebase. Setiap implementation section reference actual files dengan line numbers untuk easy navigation. Readers dapat examine actual working code untuk understand how concepts implemented dalam production context.

**Progressive Complexity**: Tutorial structured dengan progressive complexity, starting dari simpler concepts seperti image optimization dan gradually building ke more complex topics seperti CI/CD pipeline dan monitoring infrastructure. Each section builds upon previous sections, creating comprehensive understanding dari overall system.

**Practical Examples**: Tutorial include practical examples dari real use cases dalam Publishify system. Untuk frontend optimization, kami show actual optimization dari naskah listing page, dashboard, dan landing page. Untuk monitoring, kami show actual dashboards tracking real metrics seperti naskah submission rate dan user activity. Practical examples make abstract concepts concrete dan immediately applicable.

**Validation Checkpoints**: Each major section include validation checkpoints untuk verify implementation working correctly. Checkpoints include commands untuk test functionality, expected outputs, dan common troubleshooting tips untuk resolve issues. This ensure readers tidak proceed dengan broken implementation dan can confidently move forward.

---

## B. ANALISIS KEBUTUHAN

### B.1 Identifikasi Stakeholder untuk Fase 6

Fase enam implementation melibatkan multiple stakeholders dengan different perspectives dan requirements. Understanding stakeholder needs essential untuk ensure implementation meet actual requirements rather than assumed needs.

**Stakeholder Pertama: Frontend Developers** adalah primary implementers dari frontend optimization strategies. Mereka require clear guidelines tentang bagaimana implement lazy loading tanpa breaking existing functionality, bagaimana optimize images tanpa sacrificing visual quality, dan bagaimana measure improvement effectiveness. Frontend developers also concerned dengan maintainability dari optimization strategies dan ensuring optimization tidak make codebase significantly more complex. Tools yang mereka need include bundle analyzers untuk visualize bundle composition, performance profilers untuk identify bottlenecks, dan testing tools untuk ensure optimizations tidak introduce regressions.

**Stakeholder Kedua: DevOps Engineers** responsible untuk infrastructure setup, CI/CD pipeline implementation, dan monitoring configuration. Mereka require automation tools untuk eliminate manual deployment steps, clear rollback procedures untuk handle deployment failures, dan comprehensive monitoring untuk detect issues proactively. DevOps engineers also concerned dengan security implications dari deployment automation, ensuring secrets properly managed dan not exposed dalam logs atau configurations. Infrastructure as Code practices important untuk them untuk ensure reproducibility dan version control dari infrastructure configurations.

**Stakeholder Ketiga: Backend Developers** affected oleh deployment automation dan monitoring setup. Mereka require visibility into application performance through monitoring dashboards, structured logging untuk effective troubleshooting, dan minimal disruption during deployments. Backend developers also benefit dari automated testing dalam CI/CD pipeline yang catch regressions before reaching production. Clear documentation dari deployment processes important untuk enable them contribute to deployment-related tasks when needed.

**Stakeholder Keempat: QA Engineers** responsible untuk validate bahwa optimization dan deployment automation tidak introduce regressions. Mereka require automated testing integration dalam CI/CD pipeline, performance testing capabilities untuk validate optimization effectiveness, dan staging environment yang mirror production untuk realistic testing. QA engineers need clear acceptance criteria untuk each optimization effort dan tools untuk measure improvement objectively.

**Stakeholder Kelima: Product Managers** concerned dengan user experience improvement resulting dari frontend optimization dan system reliability improvement dari deployment automation. Mereka require metrics yang demonstrate value dari optimization efforts, minimal disruption to users during deployments, dan predictable release schedules enabled oleh reliable automation. Product managers appreciate visibility into system health through monitoring dashboards dan confidence dalam system stability.

**Stakeholder Keenam: End Users** ultimate beneficiaries dari optimization efforts. Mereka experience faster page loads, smoother interactions, dan more reliable service. While tidak directly involved dalam implementation, user needs drive optimization priorities. Metrics seperti page load time, time to interactive, dan uptime directly impact user satisfaction dan should be primary success criteria.

### B.2 Kebutuhan Fungsional Fase 6

Kebutuhan fungsional untuk fase enam organized by major areas untuk ensure comprehensive coverage.

#### B.2.1 Frontend Optimization Requirements

**FR-FO-01: Image Optimization Implementation**. Sistem harus implement automatic image optimization untuk all images menggunakan Next.js Image component. Requirements include automatic format conversion ke WebP untuk modern browsers dengan JPEG fallback untuk older browsers, responsive image generation dengan minimum three sizes (mobile, tablet, desktop) untuk serve appropriate size based on viewport, lazy loading untuk images below the fold untuk improve initial page load, blur placeholder generation untuk improve perceived performance during loading, dan quality optimization dengan configurable quality settings balancing size dan visual fidelity. Success criteria adalah average image size reduction minimal sixty percent dibanding original unoptimized images.

**FR-FO-02: Code Splitting Implementation**. Sistem harus implement comprehensive code splitting strategy untuk reduce initial bundle size. Requirements include route-based splitting dengan each page having separate bundle, component-level dynamic imports untuk large components not needed untuk initial render, third-party library chunking untuk prevent duplication across bundles, vendor chunk creation untuk framework code yang rarely changes, dan commons chunk untuk shared utilities used across multiple pages. Success criteria adalah initial bundle size reduction minimal fifty percent dengan time to interactive improvement minimal forty percent.

**FR-FO-03: Lazy Loading Strategy**. Sistem harus implement lazy loading untuk components dan resources not immediately visible. Requirements include component lazy loading dengan React.lazy untuk heavy components, intersection observer-based loading untuk below-fold content, prefetching untuk likely next pages based on user behavior, priority loading untuk critical resources, dan fallback UI untuk maintain layout stability during loading. Success criteria adalah Time to Interactive under three seconds untuk all major pages.

**FR-FO-04: SEO Optimization**. Sistem harus implement comprehensive SEO optimization untuk improve search engine visibility. Requirements include dynamic meta tags generation based on page content, structured data implementation dengan JSON-LD untuk books, authors, dan organization, sitemap generation dengan automatic updates when content changes, robots.txt configuration untuk guide search engine crawling, dan canonical URLs untuk prevent duplicate content issues. Success criteria adalah Lighthouse SEO score minimal ninety-five dari seratus.

**FR-FO-05: Performance Monitoring Integration**. Sistem harus integrate performance monitoring untuk track frontend metrics dalam production. Requirements include Real User Monitoring (RUM) untuk capture actual user experience, Core Web Vitals tracking untuk all pages, error tracking untuk JavaScript errors, dan performance budgets enforcement untuk prevent regressions. Success criteria adalah comprehensive visibility into production performance dengan alerts untuk regressions.

#### B.2.2 Docker Containerization Requirements

**FR-DC-01: Backend Containerization**. Backend application harus fully containerized dengan Docker untuk ensure consistency across environments. Requirements include multi-stage Dockerfile untuk minimize final image size, non-root user execution untuk security, health check configuration untuk monitor container health, environment variable support untuk configuration, dan volume mounts untuk persistent data. Success criteria adalah backend image size under one gigabyte dengan successful container startup under ten seconds.

**FR-DC-02: Frontend Containerization**. Frontend application harus containerized dengan optimized Next.js build. Requirements include standalone build configuration untuk minimal image size, static file serving dengan Nginx atau built-in server, environment variable injection untuk runtime configuration, cache optimization untuk fast rebuilds, dan health check endpoints. Success criteria adalah frontend image size under five hundred megabytes dengan successful container startup under five seconds.

**FR-DC-03: Docker Compose Orchestration**. Multi-container application harus orchestrated dengan docker-compose untuk easy local development dan deployment. Requirements include service definitions untuk backend, frontend, database, dan Redis, network configuration untuk service communication, volume definitions untuk persistent data, environment-specific compose files untuk different environments, dan dependency management ensuring correct startup order. Success criteria adalah complete stack startup dengan single command dalam under thirty seconds.

**FR-DC-04: Container Registry Integration**. Docker images harus automatically published ke container registry untuk deployment. Requirements include GitHub Container Registry atau Docker Hub integration, automatic tagging dengan version numbers dan git commit SHAs, image scanning untuk security vulnerabilities, dan cleanup policies untuk remove old images. Success criteria adalah every successful build automatically published dengan proper tags.

#### B.2.3 CI/CD Pipeline Requirements

**FR-CD-01: Automated Testing Pipeline**. CI/CD pipeline harus run comprehensive automated tests before allowing deployment. Requirements include unit test execution untuk all modules, integration test execution dengan test database, E2E test execution dengan Cypress, test result reporting dengan coverage metrics, dan failure notifications. Success criteria adalah all tests complete within ten minutes dengan clear failure reporting.

**FR-CD-02: Build Automation**. Pipeline harus automate application building untuk consistent artifacts. Requirements include dependency installation dengan caching untuk speed, application compilation dengan error reporting, Docker image building dengan multi-stage optimization, image tagging dengan version information, dan artifact storage untuk deployment. Success criteria adalah consistent builds dengan minimal manual intervention.

**FR-CD-03: Deployment Automation**. Pipeline harus automate deployment ke staging dan production environments. Requirements include staging deployment untuk every main branch commit, production deployment dengan manual approval, zero-downtime deployment strategy, automatic rollback pada failure detection, dan deployment notifications ke team. Success criteria adalah deployment completion within five minutes dengan zero production downtime.

**FR-CD-04: Environment Management**. Pipeline harus support multiple environments dengan proper configuration. Requirements include environment-specific secrets management, configuration file substitution, database migration execution, health check validation post-deployment, dan smoke test execution. Success criteria adalah reliable deployments dengan environment-appropriate configurations.

#### B.2.4 Monitoring & Logging Requirements

**FR-ML-01: Metrics Collection**. Sistem harus collect comprehensive metrics untuk monitoring. Requirements include system metrics (CPU, memory, disk, network), application metrics (request rate, response time, error rate), database metrics (query time, connection pool utilization), cache metrics (hit rate, eviction rate), dan custom business metrics (user registrations, naskah submissions). Success criteria adalah metrics collected dengan fifteen-second granularity dan retained untuk thirty days.

**FR-ML-02: Dashboard Creation**. Monitoring dashboards harus provide clear visibility into system health. Requirements include system overview dashboard dengan high-level metrics, application performance dashboard dengan detailed request metrics, database dashboard dengan query performance, cache dashboard dengan hit rates dan memory usage, dan business metrics dashboard dengan KPIs. Success criteria adalah dashboards loadable within two seconds dengan auto-refresh every thirty seconds.

**FR-ML-03: Alerting Configuration**. Alert system harus notify team proactively when issues detected. Requirements include threshold-based alerts untuk metric values, rate-of-change alerts untuk sudden spikes, compound alerts combining multiple conditions, alert routing to appropriate channels (email, Slack), dan alert suppression untuk prevent notification fatigue. Success criteria adalah critical issues detected within three minutes dengan appropriate notification.

**FR-ML-04: Structured Logging**. Application harus implement structured logging untuk effective troubleshooting. Requirements include consistent log format across services, appropriate log levels (debug, info, warning, error), contextual information dalam logs (request ID, user ID), log aggregation dari multiple instances, dan log retention policies. Success criteria adalah logs searchable dan filterable dengan response time under one second untuk typical queries.

### B.3 Kebutuhan Non-Fungsional

Kebutuhan non-fungsional define quality attributes yang system must possess untuk be considered successful.

**Performance Requirements**: Frontend harus achieve Lighthouse performance score minimal ninety dengan Core Web Vitals meeting "good" thresholds (LCP under 2.5 seconds, FID under 100 milliseconds, CLS under 0.1). Backend API response time harus remain under fifty milliseconds untuk P95 percentile setelah frontend optimization. Docker container startup time harus under fifteen seconds untuk ensure fast scaling. CI/CD pipeline harus complete within fifteen minutes untuk maintain fast feedback loops.

**Reliability Requirements**: Deployment automation harus achieve success rate minimal ninety-five percent dengan automatic rollback untuk failures. Monitoring system harus have uptime minimal ninety-nine point nine percent untuk ensure continuous visibility. Alert delivery harus occur within three minutes dari issue detection. Zero-downtime deployment strategy harus ensure no user-facing disruption during releases.

**Security Requirements**: Container images harus scanned untuk vulnerabilities dengan critical vulnerabilities blocking deployment. Secrets dalam CI/CD pipeline harus properly encrypted dan tidak exposed dalam logs. Production environment harus have restricted access dengan proper authentication. Application logs harus not contain sensitive information seperti passwords atau tokens.

**Maintainability Requirements**: Documentation harus comprehensive dengan clear instructions untuk common operations. Code changes untuk optimization harus not significantly increase complexity. Monitoring dashboards harus be self-explanatory dengan clear metric definitions. CI/CD pipeline harus have clear failure messages untuk easy troubleshooting.

**Scalability Requirements**: Docker containerization harus support horizontal scaling dengan load balancing. Monitoring infrastructure harus handle increased metric volume as system grows. CI/CD pipeline harus support parallel job execution untuk faster completion as test suite grows. Frontend optimization harus maintain effectiveness as content volume increases.

### B.4 Skenario Use Case Fase 6

Use cases illustrate how different stakeholders interact dengan implemented systems.

**Use Case 1: Developer Implements Image Optimization**

**Aktor**: Frontend Developer  
**Precondition**: Developer familiar dengan Next.js Image component basics  
**Main Flow**:

1. Developer identify images dalam page yang need optimization melalui Lighthouse audit
2. Developer replace standard img tags dengan Next.js Image component
3. Developer configure component dengan appropriate width, height, dan loading strategy
4. Developer add blur placeholder untuk improve perceived performance
5. Developer test implementation locally dengan throttled network untuk verify optimization
6. Developer measure improvement menggunakan Lighthouse dan Chrome DevTools
7. Developer commit changes dan create pull request
8. CI/CD pipeline run automated tests dan performance checks
9. Developer address any issues identified dalam review atau automated checks
10. Pull request merged dan changes deployed ke staging untuk final validation

**Postcondition**: Images optimized dengan measurable improvement dalam page load metrics  
**Alternative Flow**: Jika optimization break existing functionality, developer rollback changes dan investigate issue

**Use Case 2: DevOps Engineer Deploys New Version**

**Aktor**: DevOps Engineer  
**Precondition**: New version ready untuk deployment dengan passing tests  
**Main Flow**:

1. Engineer navigate to GitHub Actions workflow untuk production deployment
2. Engineer trigger deployment workflow dengan manual approval
3. Workflow build Docker images dengan new version tag
4. Workflow push images to container registry
5. Workflow deploy to staging environment untuk smoke testing
6. Automated smoke tests run untuk verify basic functionality
7. Engineer review staging deployment dan manual testing results
8. Engineer approve production deployment
9. Workflow deploy to production dengan rolling update strategy
10. Workflow verify deployment success melalui health checks
11. Workflow send notification tentang successful deployment
12. Engineer monitor production metrics untuk ensure stability

**Postcondition**: New version deployed ke production dengan zero downtime  
**Alternative Flow**: Jika deployment fail, workflow automatically rollback ke previous version dan notify team

**Use Case 3: Operations Team Investigates Performance Issue**

**Aktor**: Operations Team Member  
**Precondition**: Alert received tentang increased response time  
**Main Flow**:

1. Team member receive alert via Slack tentang API response time spike
2. Team member open Grafana dashboard untuk investigate metrics
3. Team member identify affected endpoints dan timeframe
4. Team member check application logs untuk errors atau warnings
5. Team member examine database metrics untuk slow queries
6. Team member check cache metrics untuk degraded hit rate
7. Team member identify root cause (misalnya database connection pool exhaustion)
8. Team member implement immediate mitigation (misalnya increase pool size)
9. Team member verify metrics return to normal
10. Team member document incident dan create task untuk permanent fix

**Postcondition**: Issue resolved dan system performance restored  
**Alternative Flow**: Jika issue cannot be quickly resolved, team member escalate to development team untuk deeper investigation

### B.5 Kebutuhan Data untuk Fase 6

Data requirements ensure proper information captured dan stored untuk monitoring dan analysis.

**Performance Metrics Data**: System harus capture dan store performance metrics including timestamp dengan fifteen-second granularity, metric name dan value dengan appropriate data type (counter, gauge, histogram), service identifier untuk attribute metrics to correct service, environment label untuk distinguish between development, staging, production, dan tags untuk additional context (endpoint, HTTP method, status code). Retention period minimal thirty days untuk trending analysis.

**Log Data**: Application logs harus contain timestamp dengan millisecond precision, log level untuk filtering (debug, info, warning, error, critical), message dengan descriptive information, contextual data (request ID, user ID, session ID), stack trace untuk errors, dan service identifier. Logs harus be aggregated dari all service instances dan retained untuk minimum thirty days.

**Deployment Data**: Deployment history harus track deployment timestamp, version deployed (git commit SHA, semantic version), environment (staging, production), deployment initiator (username atau automation), deployment duration, deployment status (success, failed, rolled back), dan any errors encountered. This data enable audit trail dan troubleshooting dari deployment-related issues.

**Container Data**: Container registry harus maintain image metadata including image name dan tag, build timestamp, git commit SHA dari source code, vulnerability scan results, image size, dan layer information. This data support security compliance dan troubleshooting dari container-related issues.

---

**Lokasi File Implementation Reference:**

Tutorial akan reference actual implementations dalam files berikut:

- Frontend: `frontend/next.config.ts`, `frontend/app/layout.tsx`, `frontend/components/`
- Docker: `docker/Dockerfile.backend`, `docker/Dockerfile.frontend`, `docker-compose.yml`
- CI/CD: `.github/workflows/ci-cd.yml`, `scripts/deploy.sh`
- Monitoring: `monitoring/prometheus.yml`, `monitoring/grafana/dashboards/`
- Documentation: `docs/operations/`, `docs/deployment/`

**Total Word Count Part 1**: ~3,200 kata

---

**Navigation**: [PART 2: Perancangan Sistem →](./LAPORAN-DEVELOPMENT-STEP-BY-STEP-FASE-6-PART-2-PERANCANGAN-SISTEM.md)
