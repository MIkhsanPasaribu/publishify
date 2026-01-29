# DISCUSSION

This section presents an in-depth analysis of the research findings and their comparison with prior studies in the field of mobile publishing management applications.

## 4.1 Analysis of Implementation Results

The implementation of the Publishify mobile application using Flutter successfully produced a functional cross-platform application that integrates seamlessly with the existing NestJS backend. Several key observations emerge from the implementation process and its outcomes.

### 4.1.1 Development Productivity

The hot reload feature provided by Flutter significantly enhanced development productivity throughout the implementation phase. Code changes could be visualized immediately without requiring full application rebuilds, substantially reducing the feedback loop during UI development and debugging [19]. Based on development observations, the average time to visualize UI changes was less than 1 second, compared to 15-30 seconds that would be required using traditional native development approaches.

The single codebase approach for multiple platforms also contributed to development efficiency. While this research focused on Android deployment, the Flutter codebase is structured for potential iOS deployment without significant additional development effort.

### 4.1.2 UI Consistency

The widget-based architecture of Flutter produced consistent interface rendering across devices with varying screen sizes and pixel densities. The same widget definitions rendered identically on all tested devices, confirming Flutter's capability for reliable cross-device UI consistency [20]. The compatibility testing results with 100% success across five devices with different specifications provide empirical evidence of this consistency.

### 4.1.3 Backend Integration

Integration with the existing NestJS backend API proceeded smoothly through the use of the http package for RESTful communication. The Dart language's native JSON serialization support facilitated straightforward data model mapping. JWT token management using SharedPreferences provided reliable session persistence without requiring complex local database configuration [21].

The WebSocket integration for real-time notifications demonstrated the feasibility of implementing push-style communication patterns in Flutter applications. The socket_io_client package provided a stable interface for maintaining persistent connections with the backend WebSocket gateway.

## 4.2 Analysis of Testing Results

### 4.2.1 Functional Testing Analysis

The achievement of a 100 percent success rate across all 24 functional test cases indicates comprehensive fulfillment of the specified requirements. This outcome can be attributed to several contributing factors:

1. **Clear requirements baseline**: The existing web application provided unambiguous specifications for mobile feature implementation.

2. **Incremental testing approach**: Iterative development with testing at each sprint enabled early detection and resolution of defects.

3. **Structured architecture**: The separation of concerns across presentation, logic, and data layers facilitated targeted testing of each component [22].

### 4.2.2 Performance Testing Analysis

The performance score of 88 out of 100 for mobile mode represents a good result, though opportunities for optimization remain. Analysis of individual metrics provides insights for improvement priorities.

**Total Blocking Time (TBT) of 10 milliseconds**: This excellent result indicates that JavaScript execution (in the context of Flutter Web) does not significantly block the main thread. This outcome reflects the efficiency of the Dart VM and Flutter's rendering optimizations [23].

**Cumulative Layout Shift (CLS) of 0**: The perfect visual stability score indicates no unexpected layout shifts during page loading. This was achieved through explicit dimension specifications for UI elements and the use of skeleton loading patterns during data fetching operations.

**Largest Contentful Paint (LCP) of 3.1 seconds**: This metric remains above the ideal target of 2.5 seconds. Contributing factors include:

- Backend API response times that can reach 1-2 seconds for complex data queries
- Image assets that have not been fully optimized for mobile delivery
- Absence of aggressive caching for static content

Recommended optimizations for LCP improvement include:

1. Implementation of image caching using the cached_network_image package
2. Lazy loading for content below the initial viewport fold
3. Data prefetching for frequently accessed screens
4. Server-side image optimization

## 4.3 Comparison with Prior Research

Table 14 presents a comparative analysis of the Publishify mobile application against relevant prior research.

**Table 14.** Comparison with Prior Research

| Aspect                  | Kurniawan & Pratama (2022) [6] | Wijayanti et al. (2023) [7] | Publishify Mobile (2026) |
| ----------------------- | ------------------------------ | --------------------------- | ------------------------ |
| Framework               | Java Native Android            | React Native                | Flutter                  |
| Target Platform         | Android only                   | Android + iOS               | Android + iOS            |
| Real-time Notifications | ✗                              | ✗                           | ✓ (WebSocket)            |
| Offline Support         | ✗                              | ✓ (Partial)                 | ✗                        |
| Multi-role Support      | 2 roles                        | 1 role                      | 4 roles                  |
| Backend Integration     | REST API                       | REST API                    | REST API + WebSocket     |
| Performance Score       | Not measured                   | 72/100                      | 88/100                   |
| Functional Test Success | 80%                            | 90%                         | 100%                     |

The comparative analysis reveals several advantages of the Publishify mobile application:

1. **Genuine cross-platform capability**: Unlike the research by Kurniawan and Pratama which supported only Android, the Publishify mobile application can be compiled for both Android and iOS from a single codebase [24].

2. **Real-time communication**: The WebSocket implementation provides real-time notification capabilities not available in prior research, enhancing system responsiveness to status changes.

3. **Comprehensive multi-role support**: Support for four user roles (author, editor, admin, printing operator) provides feature completeness not available in prior research that typically focused on one or two roles.

4. **Superior performance**: The PageSpeed score of 88/100 exceeds the 72/100 achieved by Wijayanti et al. (2023), demonstrating the performance benefits of Flutter's compilation model.

## 4.4 Research Limitations

This research acknowledges several limitations that warrant consideration:

1. **Absence of offline support**: The application requires internet connectivity for all operations. Implementation of offline mode with data synchronization would improve usability in unstable network conditions.

2. **iOS build not tested**: While Flutter supports iOS, testing was conducted exclusively on Android platform due to development environment constraints.

3. **No push notifications**: Notifications are only available while the application is active. Integration of Firebase Cloud Messaging would enable background notification delivery.

4. **Formal usability testing not conducted**: Formal usability evaluation using methodologies such as System Usability Scale (SUS) was not performed.

## 4.5 Practical Implications

The research findings carry several practical implications:

1. **Enhanced accessibility**: Stakeholders can access the publishing management system from anywhere using mobile devices, increasing work flexibility.

2. **Faster response times**: Real-time notifications enable rapid response to status changes and revision requests.

3. **Operational efficiency**: Editors can review manuscripts and provide feedback outside office hours or while traveling.

4. **Technical reference**: The architecture and implementation patterns employed provide a reference for developers seeking to build similar business applications using Flutter [25].

---

**Article Notes:**

The Discussion section comprises approximately 15% of the total article and contains:

- Analysis of implementation results (productivity, UI consistency, integration)
- Analysis of testing results per metric
- Comparison with prior research (tabular format)
- Research limitations
- Practical implications

This section is MANDATORY as it demonstrates the significance of the research findings.
