# DISCUSSION

This section presents an in-depth analysis of the research findings and their comparison with prior studies in the field.

## 4.1 Analysis of Implementation Results

The implementation of the Publishify web-based book publishing information system successfully produced a functional platform that integrates frontend and backend components in a cohesive manner. Several key observations emerge from the implementation process and its outcomes.

### 4.1.1 Architectural Effectiveness

The selection of a separated frontend-backend architecture utilizing Next.js and NestJS proved to be an effective design decision. This architectural pattern enabled independent development and deployment of each layer, facilitating parallel workstreams during the implementation phase [20]. The modular structure of NestJS, in particular, promoted code organization and maintainability, with each functional domain encapsulated within its respective module.

The implementation of role-based access control across four user roles (author, editor, admin, and printing operator) demonstrated the flexibility of the chosen architecture. Each role presents a customized dashboard interface while sharing common authentication and notification infrastructure, thereby reducing code duplication while maintaining role-specific functionality.

### 4.1.2 Technology Stack Considerations

The technology stack combining Next.js 16, NestJS 10, PostgreSQL, and Prisma ORM delivered several tangible benefits. TypeScript adoption across both frontend and backend layers provided type safety that reduced runtime errors and improved developer experience through enhanced IDE support [21]. The Prisma ORM simplified database operations while maintaining type safety through auto-generated client types that correspond to the database schema.

The integration of real-time capabilities through Socket.io addressed a significant limitation observed in prior publishing management systems. The ability to deliver instant notifications regarding manuscript status changes, new feedback, and other events enhances user experience and reduces the need for manual status checking [22].

### 4.1.3 User Interface Design

The frontend implementation utilizing shadcn/ui components built on Radix UI primitives ensured accessibility compliance while maintaining a modern aesthetic. The responsive design approach enabled the interface to adapt seamlessly across desktop and mobile devices, addressing the need for multi-device accessibility in contemporary web applications.

## 4.2 Analysis of Testing Results

### 4.2.1 Functional Testing Analysis

The achievement of a 100 percent success rate across all 28 functional test cases indicates comprehensive fulfillment of the specified requirements. This outcome can be attributed to several factors:

1. **Clear requirements definition**: Detailed requirements analysis at the project outset provided unambiguous specifications for implementation.

2. **Incremental testing approach**: The iterative development methodology enabled early detection and resolution of defects within each sprint.

3. **Structured architecture**: The separation of concerns across controller, service, and repository layers facilitated unit and integration testing [23].

### 4.2.2 Performance Testing Analysis

The performance testing results reveal differentiated outcomes between desktop and mobile evaluation modes. Desktop performance achieved an exceptional score of 98 out of 100, demonstrating that the application meets and exceeds industry standards for web performance.

**Total Blocking Time (TBT) of 10 milliseconds**: This excellent result indicates minimal JavaScript execution blocking the main thread, enabling responsive user interactions. The low TBT can be attributed to efficient code splitting provided by Next.js and the avoidance of synchronous heavy computations [24].

**Cumulative Layout Shift (CLS) of 0**: The perfect score for visual stability indicates that no unexpected layout shifts occur during page loading. This was achieved through explicit dimension specifications for images and containers, as well as the use of skeleton loaders during data fetching operations.

**Largest Contentful Paint (LCP) of 3.1 seconds on mobile**: This metric exceeds the recommended target of 2.5 seconds and represents an area for improvement. Contributing factors include:

- Backend API response times that can reach 1-2 seconds for complex data queries
- Image assets that have not been fully optimized for mobile delivery
- Absence of aggressive caching strategies for static content

Recommended optimizations for LCP improvement include:

1. Implementation of image optimization using Next.js Image component with lazy loading
2. Introduction of server-side caching with Redis for frequently accessed data
3. CDN integration for static asset delivery
4. API response pagination and lazy loading for data-heavy pages

## 4.3 Comparison with Prior Research

Table 10 presents a comparative analysis of the Publishify system against relevant prior research.

**Table 10.** Comparison with Prior Research

| Aspect                  | Rahman & Pratama (2022) [6] | Wijayanti et al. (2023) [5] | Publishify (2026)    |
| ----------------------- | --------------------------- | --------------------------- | -------------------- |
| Framework               | PHP (CodeIgniter)           | Laravel + Vue.js            | Next.js + NestJS     |
| Architecture            | Monolithic                  | Monolithic                  | Microservices-ready  |
| Real-time Notifications | ✗                           | ✗                           | ✓ (WebSocket)        |
| Multi-role Support      | 2 roles                     | 3 roles                     | 4 roles              |
| API Type                | Server-rendered             | REST API                    | REST API + WebSocket |
| Performance Score       | Not measured                | 75/100                      | 98/100 (desktop)     |
| Functional Test Success | 85%                         | 92%                         | 100%                 |
| OAuth Integration       | ✗                           | ✗                           | ✓ (Google)           |

The comparative analysis reveals several advantages of the Publishify system:

1. **Modern architecture**: The adoption of Next.js and NestJS provides a more maintainable and scalable architecture compared to traditional PHP frameworks. The separation of frontend and backend enables independent scaling and deployment [25].

2. **Real-time capabilities**: The implementation of WebSocket-based notifications represents a significant advancement over prior systems that relied solely on periodic page refreshes or email notifications for status updates.

3. **Superior performance**: The performance score of 98/100 for desktop mode substantially exceeds the 75/100 achieved by Wijayanti et al. (2023), demonstrating the performance benefits of modern JavaScript frameworks and server-side rendering.

4. **Comprehensive role support**: Support for four distinct user roles provides a more complete representation of the publishing workflow compared to prior systems limited to two or three roles.

## 4.4 Research Limitations

This research acknowledges several limitations that warrant consideration:

1. **Single deployment environment**: Testing was conducted exclusively on a single cloud server instance, which may not fully represent performance characteristics under varying infrastructure configurations.

2. **Limited user testing**: Formal usability testing with actual publishing industry professionals was not conducted due to time constraints.

3. **Payment integration absence**: The current implementation does not include payment gateway integration, which would be essential for commercial deployment.

4. **Mobile application scope**: This research focused exclusively on web-based implementation; a companion mobile application development constitutes a separate research effort.

## 4.5 Practical Implications

The research findings carry several practical implications for the publishing industry and software development community:

1. **Operational efficiency**: Publishers adopting similar systems can anticipate significant reductions in administrative overhead and processing time for manuscript management.

2. **Stakeholder coordination**: The centralized platform with real-time notifications facilitates improved coordination among authors, editors, and administrators.

3. **Technical reference**: The architecture and implementation patterns employed provide a reference for developers seeking to build similar business workflow applications using modern JavaScript frameworks [26].

4. **Accessibility enhancement**: The responsive design approach ensures accessibility across devices, enabling stakeholders to participate in the publishing workflow regardless of their preferred device type.

---

**Article Notes:**

The Discussion section comprises approximately 15% of the total article and contains:

- Analysis of implementation results (architecture, technology stack, UI design)
- Analysis of testing results per metric
- Comparison with prior research (tabular format)
- Research limitations
- Practical implications

This section is MANDATORY as it demonstrates the significance of the research findings.
