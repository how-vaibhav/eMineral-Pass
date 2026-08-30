export interface ResourceArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Markdown or HTML representation
  date: string;
  author: string;
  tags: string[];
  seoKeywords: string[];
}

export const resources: ResourceArticle[] = [
  {
    id: "1",
    slug: "how-to-apply-eform-c",
    title: "How to Apply for an eForm-C in Uttar Pradesh",
    excerpt: "A comprehensive guide on the requirements, documents, and step-by-step process for generating an eForm-C for mineral transport in UP.",
    content: `
      <h2>Introduction to eForm-C</h2>
      <p>The eForm-C is a mandatory digital transit pass required for the legal transportation of minerals in Uttar Pradesh. It ensures compliance with the Department of Geology and Mining's regulations and helps prevent illegal mining.</p>
      
      <h2>Prerequisites for Application</h2>
      <ul>
        <li>Valid mining lease or license</li>
        <li>Registered vehicle details</li>
        <li>GSTIN and PAN details</li>
        <li>Approval from the District Mining Officer (DMO)</li>
      </ul>

      <h2>Step-by-Step Generation Process</h2>
      <ol>
        <li>Log in to your MineralTrack dashboard.</li>
        <li>Navigate to the <strong>Generate Pass</strong> section.</li>
        <li>Select the mineral type, quantity, and source/destination districts.</li>
        <li>Enter the verified vehicle number. The system will automatically check for active GPS and fitness certificates.</li>
        <li>Submit the application and pay any requisite royalty fees via the integrated payment gateway.</li>
        <li>Once approved, the eForm-C will be generated with a unique QR code.</li>
      </ol>

      <h2>Important Considerations</h2>
      <p>Always ensure the eForm-C is carried by the driver, either digitally or physically, during transit. The QR code must be scannable at checkpoints.</p>
    `,
    date: "2026-08-25",
    author: "MineralTrack Compliance Team",
    tags: ["eForm-C", "Guide", "Compliance"],
    seoKeywords: ["eForm-C application", "UP mineral pass", "how to generate transit pass", "mining department UP", "digital form C"],
  },
  {
    id: "2",
    slug: "new-mining-transport-regulations-2026",
    title: "New Mining Transport Regulations in UP (2026 Update)",
    excerpt: "Stay compliant with the latest changes to mineral transport regulations, including stricter GPS tracking mandates and automated weighbridge integrations.",
    content: `
      <h2>Overview of the 2026 Policy Changes</h2>
      <p>In an effort to further digitize and monitor mineral transport, the Uttar Pradesh government has introduced updated regulations effective from Q3 2026. These changes impact all leaseholders, contractors, and transport companies.</p>

      <h2>Key Regulatory Updates</h2>
      <h3>1. Mandatory IoT GPS Integration</h3>
      <p>All vehicles transporting minor or major minerals must now be equipped with an AIS-140 compliant GPS device that streams data directly to the state's central server. eForm-Cs cannot be generated for non-compliant vehicles.</p>
      
      <h3>2. Automated Weighbridge Synchronization</h3>
      <p>Manual entry of mineral weight is being phased out. Authorized weighbridges must now push weight data directly via API to the mineral pass generation system to prevent overloading.</p>

      <h3>3. Enhanced QR Code Verification</h3>
      <p>The new eForm-C QR codes will include encrypted timestamps and geo-location data of generation, making it nearly impossible to duplicate passes.</p>

      <h2>How MineralTrack Helps You Comply</h2>
      <p>Our platform is already updated to meet the 2026 standards. We offer seamless GPS provider integrations and automated weighbridge API connections to ensure your operations are never interrupted.</p>
    `,
    date: "2026-08-10",
    author: "Regulatory Affairs",
    tags: ["Regulations", "GPS", "News"],
    seoKeywords: ["UP mining rules 2026", "mineral transport regulations", "AIS-140 GPS mining", "weighbridge integration", "mining compliance updates"],
  },
  {
    id: "3",
    slug: "understanding-qr-code-verification",
    title: "Understanding QR Code Verification for Mineral Passes",
    excerpt: "Learn how MineralTrack's secure QR code system prevents fraud and streamlines checkpoint inspections for authorities.",
    content: `
      <h2>The Problem with Paper Passes</h2>
      <p>Historically, paper-based transit passes were highly susceptible to forgery, tampering, and multiple re-uses. This led to significant revenue loss for the state and unfair advantages for illegal operators.</p>

      <h2>The Digital Solution: Encrypted QR Codes</h2>
      <p>Every eForm-C generated through MineralTrack includes a highly secure, dynamically generated QR code. When scanned by a designated authority using our verification app, it retrieves real-time data from the server.</p>

      <h2>What Data is Verified?</h2>
      <ul>
        <li><strong>Validity Status:</strong> Is the pass currently active, expired, or already marked as 'delivered'?</li>
        <li><strong>Vehicle Match:</strong> Does the physical vehicle match the registration number on the pass?</li>
        <li><strong>Quantity:</strong> Does the loaded quantity match the authorized weight?</li>
        <li><strong>Route:</strong> Is the vehicle on the approved route between the source and destination?</li>
      </ul>

      <h2>Benefits for Transporters</h2>
      <p>While designed for enforcement, secure QR codes also benefit legitimate transporters. Checkpoint inspections are significantly faster, reducing transit times and improving supply chain efficiency.</p>
    `,
    date: "2026-07-28",
    author: "Tech Team",
    tags: ["Technology", "Security", "QR Verification"],
    seoKeywords: ["QR code eForm-C", "mineral pass verification", "secure transit pass", "anti-fraud mining", "checkpoint inspection digital"],
  }
];

export function getResourceBySlug(slug: string): ResourceArticle | undefined {
  return resources.find((r) => r.slug === slug);
}
