export const SERVICES = [
    {
        slug: "business-consulting",
        title: "Business Consulting",
        tagline: "Operational clarity. Strategic momentum.",
        summary:
            "Sharpen operations, decode workflows and unlock measurable efficiency across the entire business stack.",
        problems: [
            "Fragmented operations and unclear ownership",
            "Manual workflows draining productivity",
            "Lack of strategic direction at the operations layer",
        ],
        outcomes: [
            "Documented, optimized process landscape",
            "Reduced operational overhead",
            "Decision-ready operating model",
        ],
        offerings: [
            "Operational optimization",
            "Business process improvement",
            "Strategic advisory",
            "Workflow mapping",
            "Infrastructure enhancement",
        ],
        industries: ["Hospitality", "Retail", "Logistics", "Manufacturing"],
    },
    {
        slug: "analytics-bi",
        title: "Analytics & Business Intelligence",
        tagline: "From raw data to decisive insight.",
        summary:
            "Design and deploy modern analytics ecosystems — dashboards, KPIs and reporting architectures that actually drive action.",
        problems: [
            "Reports scattered across teams and tools",
            "No single source of truth",
            "KPIs that don't reflect business reality",
        ],
        outcomes: [
            "Executive-grade dashboards",
            "Self-service analytics culture",
            "Trustworthy, governed data",
        ],
        offerings: [
            "Dashboard development",
            "KPI systems",
            "Power BI consulting",
            "Reporting architecture",
            "Performance tracking",
        ],
        industries: ["Retail", "Hospitality", "Supply Chain", "Technology"],
    },
    {
        slug: "it-consulting",
        title: "IT Consulting",
        tagline: "Modern systems. Resilient backbones.",
        summary:
            "Architect, modernize and optimize your technology stack to support sustainable, secure growth.",
        problems: [
            "Aging infrastructure slowing the business",
            "High technical debt, low velocity",
            "Misaligned tech investments",
        ],
        outcomes: [
            "Future-proof software architecture",
            "Lower operating cost",
            "Scalable, secure platforms",
        ],
        offerings: [
            "Software architecture",
            "Infrastructure consulting",
            "Systems optimization",
            "Digital transformation",
        ],
        industries: ["Technology", "SMEs", "Manufacturing", "Logistics"],
    },
    {
        slug: "process-automation",
        title: "Process Automation",
        tagline: "Engineer the boring out of the business.",
        summary:
            "Replace repetitive manual operations with reliable, monitored, automated systems that scale with you.",
        problems: [
            "Hours lost to manual tracking and reconciliations",
            "Error-prone copy-paste workflows",
            "No visibility into operational health",
        ],
        outcomes: [
            "Automated end-to-end workflows",
            "Real-time operational monitoring",
            "Higher accuracy, faster delivery",
        ],
        offerings: [
            "Workflow automation",
            "Automated business tracking",
            "Operational monitoring",
            "Internal systems",
        ],
        industries: ["Logistics", "Supply Chain", "Retail", "Hospitality"],
    },
    {
        slug: "software-architecture",
        title: "Software Architecture",
        tagline: "Built right. Built to scale.",
        summary:
            "We design pragmatic, enterprise-grade software architecture for products and platforms expected to last.",
        problems: [
            "Systems that can't scale with demand",
            "Brittle integrations and ad-hoc design",
            "No coherent platform strategy",
        ],
        outcomes: [
            "Clear architectural blueprint",
            "Reduced integration risk",
            "Sustainable platform velocity",
        ],
        offerings: [
            "Solution architecture",
            "Integration design",
            "Cloud architecture",
            "Platform strategy",
        ],
        industries: ["Technology", "Manufacturing", "SMEs"],
    },
    {
        slug: "digital-transformation",
        title: "Digital Transformation",
        tagline: "Reimagine how the business runs.",
        summary:
            "A pragmatic, outcome-led approach to modernizing operations, technology and decision-making across the enterprise.",
        problems: [
            "Disjointed digital initiatives",
            "Change without measurable outcomes",
            "Tech-led rather than business-led transformation",
        ],
        outcomes: [
            "Aligned business + technology roadmap",
            "Measurable ROI on every initiative",
            "Modern operating model",
        ],
        offerings: [
            "Transformation roadmap",
            "Operating model design",
            "Change enablement",
            "Tailored business tools",
        ],
        industries: ["Hospitality", "Retail", "Logistics", "Technology", "SMEs"],
    },
];

export const INDUSTRIES = [
    {
        slug: "hospitality",
        title: "Hospitality & Hotels",
        summary:
            "Property-level intelligence, occupancy analytics and guest insights for modern hospitality groups.",
        challenges: [
            "Fragmented PMS and POS data",
            "No unified occupancy & revenue view",
            "Guest insights trapped inside silos",
        ],
        solutions: [
            "Unified operational reporting",
            "Occupancy & revenue intelligence",
            "Customer & guest analytics",
        ],
        useCases: [
            "Group-wide revenue dashboards",
            "Real-time occupancy KPI tracking",
            "F&B operational analytics",
        ],
    },
    {
        slug: "retail",
        title: "Retail & E-commerce",
        summary:
            "Inventory clarity, channel performance and customer insight engines for retail at any scale.",
        challenges: [
            "Inventory mismatches across channels",
            "Lack of customer segmentation",
            "Margin leakage in operations",
        ],
        solutions: [
            "Inventory optimization systems",
            "Multi-channel sales dashboards",
            "Customer & cohort analytics",
        ],
        useCases: [
            "SKU-level performance dashboards",
            "Store vs. online attribution",
            "Customer lifetime value modeling",
        ],
    },
    {
        slug: "logistics",
        title: "Logistics & Supply Chain",
        summary:
            "Movement-level visibility, SLA monitoring and supply chain intelligence for operationally complex businesses.",
        challenges: [
            "No real-time visibility on shipments",
            "Manual SLA & exception tracking",
            "Disconnected vendor & route data",
        ],
        solutions: [
            "Operational visibility platforms",
            "Movement tracking systems",
            "Performance monitoring & alerts",
        ],
        useCases: [
            "Live shipment dashboards",
            "Vendor SLA scorecards",
            "Route performance analytics",
        ],
    },
    {
        slug: "manufacturing",
        title: "Manufacturing",
        summary:
            "Process telemetry, throughput intelligence and operational efficiency for production-driven organizations.",
        challenges: [
            "Plant-floor data not surfaced to leadership",
            "Manual quality & throughput tracking",
            "Reactive maintenance cycles",
        ],
        solutions: [
            "Process monitoring systems",
            "Operational efficiency dashboards",
            "Production KPI architectures",
        ],
        useCases: [
            "OEE dashboards",
            "Throughput vs. plan tracking",
            "Quality issue analytics",
        ],
    },
    {
        slug: "technology",
        title: "IT & Technology Firms",
        summary:
            "Architecture, infrastructure and engineering advisory for product, platform and SaaS companies.",
        challenges: [
            "Scaling architecture under product growth",
            "Fragmented engineering tooling",
            "Unclear platform investment strategy",
        ],
        solutions: [
            "Systems consulting",
            "Software advisory",
            "Infrastructure improvement",
        ],
        useCases: [
            "Architecture reviews",
            "Cloud cost optimization",
            "Platform strategy engagements",
        ],
    },
    {
        slug: "smes",
        title: "SMEs & Growing Businesses",
        summary:
            "Pragmatic digital transformation, automation and operational scaling for ambitious growing companies.",
        challenges: [
            "Manual back-office operations",
            "Founder dependency on operations",
            "No consolidated reporting",
        ],
        solutions: [
            "Digital transformation programs",
            "Automation of core workflows",
            "Operational scaling playbooks",
        ],
        useCases: [
            "Owner-level KPI dashboards",
            "Workflow automation for sales & ops",
            "Tooling consolidation programs",
        ],
    },
];

export const INSIGHTS = [
    {
        slug: "building-modern-operational-dashboards",
        title: "Building Modern Operational Dashboards That Executives Actually Use",
        excerpt:
            "Most dashboards die in pilot. The ones that survive solve a real decision, in a real meeting, every week. Here's the operating model behind dashboards that stick.",
        category: "Business Intelligence",
        readTime: "8 min read",
        date: "Nov 2025",
    },
    {
        slug: "automation-without-chaos",
        title: "Automation Without Chaos: A Framework for Mid-Market Operations",
        excerpt:
            "Process automation fails when teams automate noise. We share the prioritization framework MIR Consulting uses to deliver durable automation in 90 days.",
        category: "Process Automation",
        readTime: "6 min read",
        date: "Oct 2025",
    },
    {
        slug: "kpis-that-drive-decisions",
        title: "KPIs That Drive Decisions, Not Decoration",
        excerpt:
            "A practical guide to designing KPI systems that align with the operating model — and survive the next leadership review.",
        category: "Analytics",
        readTime: "7 min read",
        date: "Oct 2025",
    },
    {
        slug: "digital-transformation-roadmap",
        title: "A Pragmatic Digital Transformation Roadmap for Mid-Market Companies",
        excerpt:
            "Transformation is rarely about technology first. We share the four-phase roadmap MIR Consulting uses with hospitality, retail and logistics clients.",
        category: "Digital Transformation",
        readTime: "9 min read",
        date: "Sep 2025",
    },
];

export const CAPABILITIES = [
    "Business Strategy",
    "Operational Optimization",
    "Power BI & Analytics",
    "Software Architecture",
    "Process Automation",
    "Digital Transformation",
    "IT Advisory",
    "Dashboard Development",
];

export const INDUSTRY_TAGS = [
    "Hospitality",
    "Retail",
    "Logistics",
    "Supply Chain",
    "Manufacturing",
    "Technology",
    "SMEs",
];
