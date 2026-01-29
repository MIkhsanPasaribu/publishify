# INTRODUCTION

The book publishing industry in Indonesia has undergone substantial transformation in response to the rapid advancement of digital technologies over the past decade. According to data published by the Indonesian Publishers Association (IKAPI), the number of active publishers in Indonesia exceeds 1,500 organizations, collectively producing an average of 30,000 new book titles annually [1]. Despite this considerable output, a significant proportion of publishing operations continue to rely on conventional processes characterized by extensive manual communication through email correspondence, telephone calls, and face-to-face meetings, resulting in temporal inefficiencies and heightened potential for coordination errors [2].

The traditional book publishing workflow encompasses a series of complex stages beginning with manuscript submission, progressing through editorial review, editing, proofreading, cover design, layout composition, ISBN registration, and culminating in printing and distribution. Each stage necessitates coordination among various stakeholders including authors, editors, designers, and printing operators [3]. This inherent complexity frequently results in publication delays, document misplacement, and difficulties in tracking manuscript status throughout the publishing pipeline. Research conducted by Suryani and Wahyudi (2023) demonstrated that the average publication timeline at conventional publishers ranges from 6 to 12 months, with approximately 40 percent of that duration consumed by administrative and coordination processes that could potentially be automated [4].

Web-based information systems present a viable solution for addressing these operational challenges by providing a centralized platform accessible to all stakeholders in real-time. Several prior studies have developed similar systems; however, limitations persist regarding scalability, user experience quality, and comprehensive feature integration [5]. Research by Rahman and Pratama (2022) developed a PHP-based publishing system capable of reducing processing time by up to 30 percent, yet the system lacked support for real-time notifications and exhibited limitations in interface responsiveness [6].

The emergence of modern JavaScript frameworks such as Next.js and NestJS has created opportunities for developing information systems that are more responsive, scalable, and maintainable than their predecessors. Next.js provides server-side rendering and static site generation capabilities that optimize web application performance, while NestJS offers a structured modular architecture for backend development that promotes code organization and testability [7]. The combination of these two frameworks with PostgreSQL database and Prisma Object-Relational Mapping enables the development of robust systems with type-safe data handling [8].

Based on the aforementioned background, this research aims to develop Publishify, a comprehensive web-based book publishing information system. The system is designed to digitalize the entire publishing workflow with features encompassing: (1) manuscript management with real-time status tracking, (2) an editorial review system with structured feedback mechanisms, (3) publishing package management with automated cost calculation, (4) real-time notifications utilizing WebSocket technology, and (5) analytical dashboards for performance monitoring. System development follows the waterfall methodology with iterative refinement to ensure quality and alignment with user requirements.

The research problems addressed in this study are formulated as follows: (1) How can an information system architecture be designed to accommodate the complete publishing workflow from manuscript submission through publication? (2) How can the system be implemented using Next.js and NestJS frameworks with PostgreSQL database integration? (3) What are the performance characteristics and functional success rates of the developed system?

The anticipated benefits of this research include: (1) for publishers, the system can enhance operational efficiency and reduce publication processing time; (2) for authors, the system provides transparency regarding manuscript status and facilitates communication with editors; (3) for the academic community, this research contributes to the body of knowledge concerning web-based information system development utilizing modern architectural patterns.

---

**Article Notes:**

The Introduction section comprises approximately 15% of the total article and contains:

- Background of the problem with supporting data
- Review of prior research
- Identification of research gaps
- Research objectives and problem formulation
- Research benefits

Citations follow IEEE format with sequential numbers [1], [2], etc., which are referenced in the References section.
