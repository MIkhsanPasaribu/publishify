# INTRODUCTION

The proliferation of mobile devices has fundamentally transformed how individuals interact with digital services across personal and professional domains. Global statistics indicate that mobile devices now account for approximately 60 percent of total internet traffic, with users increasingly expecting mobile accessibility for applications that were traditionally confined to desktop environments [1]. This behavioral shift has created imperative demand for mobile extensions of enterprise web applications, enabling users to conduct business operations from anywhere at any time.

The book publishing industry, while undergoing digital transformation through web-based management systems, has not fully addressed the mobility requirements of modern publishing workflows. Publishers, authors, and editors frequently need to access manuscript status information, review documents, and communicate with stakeholders while away from their primary workstations. Prior research has demonstrated that mobile accessibility in business applications can improve response times by up to 40 percent and increase user engagement significantly [2].

The Publishify web-based book publishing information system, developed using Next.js and NestJS, successfully digitalized the manuscript management workflow for desktop users. However, the web-based nature of the system, while accessible through mobile browsers, does not provide the optimized user experience that native-like mobile applications can deliver. Mobile applications offer advantages including offline capability potential, push notification support, and user interface optimizations specifically designed for touch-based interaction patterns [3].

Cross-platform mobile development frameworks have emerged as efficient solutions for extending web-based systems to mobile platforms. Among available frameworks, Flutter has gained significant adoption due to its single codebase approach for multiple platforms, widget-based architecture that enables consistent UI rendering, and performance characteristics that approach native application levels [4]. Research by Wu (2023) demonstrated that Flutter applications achieve frame rates comparable to native applications while reducing development time by approximately 30 percent compared to maintaining separate native codebases [5].

Prior research in mobile publishing management applications has explored various approaches. Kurniawan and Pratama (2022) developed an Android-native manuscript management application using Java, achieving functional completeness but limiting deployment to a single platform [6]. Wijayanti et al. (2023) implemented a React Native-based editorial system with cross-platform capabilities but did not incorporate real-time notification functionality [7]. These studies indicate opportunities for advancement through the adoption of modern cross-platform frameworks with real-time communication capabilities.

Based on the identified opportunities, this research aims to develop a mobile application for the Publishify book publishing management system utilizing the Flutter framework. The specific objectives encompass: (1) designing a mobile application architecture that integrates seamlessly with the existing Publishify backend API, (2) implementing core manuscript management features with role-based access for authors, editors, administrators, and printing operators, (3) incorporating real-time notification capabilities using WebSocket technology, and (4) evaluating application performance and functional completeness through systematic testing.

The research questions addressed in this study are formulated as follows: (1) How can a mobile application architecture be designed to effectively integrate with an existing NestJS backend while maintaining feature parity with the web interface? (2) What are the implementation considerations for multi-role support in a Flutter-based publishing management application? (3) What are the performance characteristics and functional success rates of the developed mobile application?

The anticipated benefits of this research include: (1) for publishing stakeholders, enhanced accessibility to manuscript management functions regardless of location; (2) for the software development community, documented patterns for integrating Flutter applications with NestJS backends; (3) for academic research, contribution to the body of knowledge regarding cross-platform mobile development for enterprise applications.

---

**Article Notes:**

The Introduction section comprises approximately 15% of the total article and contains:

- Background of mobile computing trends and publishing industry needs
- Review of prior research in mobile publishing applications
- Identification of research gaps
- Research objectives and problem formulation
- Research benefits

Citations follow IEEE format with sequential numbers [1], [2], etc., which are referenced in the References section.
