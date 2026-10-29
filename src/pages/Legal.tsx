import { ArrowLeft } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/layout/Footer";
import { subDays, format } from "date-fns";

export default function Legal() {
  const lastUpdated = format(subDays(new Date(), 7), "MMMM d, yyyy");
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-subtle">
      <div className="flex-1 max-w-4xl mx-auto px-6 py-12">
        <Link to="/login" className="inline-flex items-center text-primary hover:text-primary-hover mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Login
        </Link>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Legal Information</CardTitle>
            <p className="text-sm text-muted-foreground pt-2">
              Last updated: {lastUpdated}
            </p>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none space-y-6 text-muted-foreground">
            <p>
              This Legal Information document outlines the legal rights, obligations, and protections related to the use of the 
              Kyengera Parents' School - Mugongo School Portal (the "System") and associated services provided by Kyengera Parents' School - Mugongo (collectively, "Kyengera Parents' School - Mugongo," "we," "our," or "us"). By accessing or using the System, you acknowledge and 
              agree to be bound by these legal terms.
            </p>

            <h2 className="text-xl font-semibold text-foreground">1. Copyright Notice</h2>
            <p>
              © {new Date().getFullYear()} Kyengera Parents' School - Mugongo. All rights reserved. The content, design, graphics, 
              logos, button icons, images, audio clips, video content, digital downloads, data compilations, and software presented on 
              and through the School Management System are the property of Kyengera Parents' School - Mugongo or its content suppliers and are protected 
              by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws. 
              The compilation (meaning the collection, arrangement, and assembly) of all content on this System is the exclusive property 
              of Kyengera Parents' School - Mugongo and is protected by international copyright laws.
            </p>
            <p className="mt-4">
              No part of the System, including but not limited to text, graphics, logos, icons, images, audio clips, video content, 
              downloads, educational materials, e-learning content, electoral data, attendance records, analytics reports, or software, 
              may be reproduced, duplicated, copied, sold, resold, visited, distributed, transmitted, displayed, published, licensed, 
              modified, or otherwise exploited for any purpose without the express written permission of Kyengera Parents' School - Mugongo.
            </p>

            <h2 className="text-xl font-semibold text-foreground">2. Intellectual Property Rights</h2>
            <p className="mb-4">
              All intellectual property rights in and to the School Management System and its components, including but not limited to 
              the following, are owned by or licensed to Kyengera Parents' School - Mugongo:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Software and Source Code:</strong> All custom-developed software, applications, interfaces, APIs, databases, and underlying source code powering the School Management System</li>
              <li><strong>Educational Content:</strong> Over 100 educational videos, tutorials, e-learning materials, lesson plans, assignments, and assessment materials</li>
              <li><strong>Digital Library:</strong> Catalog system, book descriptions, and organizational structure for 500+ books and resources</li>
              <li><strong>Trademarks and Branding:</strong> "Kyengera Parents' School - Mugongo," school logos, emblems, mascots, color schemes, and all associated branding elements</li>
              <li><strong>User Interface Design:</strong> Dashboard layouts, navigation structures, responsive design elements, visual themes, icons, and user experience workflows</li>
              <li><strong>Documentation and Materials:</strong> User manuals, help guides, support documentation, training materials, and system specifications</li>
              <li><strong>Analytics and Reporting Tools:</strong> Custom algorithms, data visualization methods, report templates, and performance tracking systems</li>
              <li><strong>Electoral System:</strong> Voting platform architecture, ballot design, results calculation algorithms, and security implementations</li>
              <li><strong>Attendance System:</strong> Tracking methodologies, analytics algorithms, heatmap visualizations, and reporting systems</li>
              <li><strong>Communication Platform:</strong> Messaging system architecture, notification systems, and communication protocols</li>
              <li><strong>Multimedia Content:</strong> School gallery photos, event videos, promotional materials, and branded entertainment content</li>
              <li><strong>Database Structures:</strong> Data models, table relationships, indexing strategies, and information architecture</li>
            </ul>
            <p className="mt-4">
              Unauthorized use, reproduction, distribution, modification, public display, or creation of derivative works of any 
              intellectual property may violate copyright, trademark, patent, and other applicable laws, and could result in criminal 
              or civil penalties.
            </p>

            <h2 className="text-xl font-semibold text-foreground">3. License to Use the System</h2>
            <p className="mb-4">
              Subject to your compliance with these legal terms and all applicable school policies, Kyengera Parents' School - Mugongo grants you a 
              limited, non-exclusive, non-transferable, revocable license to access and use the School Management System solely for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Legitimate educational purposes directly related to your role as a student, parent/guardian, teacher, or administrator</li>
              <li>Accessing personal academic information, grades, attendance records, and class schedules</li>
              <li>Submitting assignments, assessments, and educational work</li>
              <li>Participating in approved school activities, including electoral voting and communication</li>
              <li>Viewing approved educational and entertainment content</li>
              <li>Accessing school resources, including the digital library and e-learning platform</li>
            </ul>
            <p className="mt-4">
              This license does not include the right to: (a) resell, redistribute, or provide commercial use of the System or its 
              content; (b) modify, reverse engineer, or create derivative works; (c) download or copy content except as expressly 
              permitted; (d) make any unauthorized use of the System; or (e) use any data mining, robots, or similar automated data 
              gathering methods.
            </p>

            <h2 className="text-xl font-semibold text-foreground">4. User Obligations and Prohibited Conduct</h2>
            <p className="mb-4">
              By accessing and using the School Management System, users agree to comply with all applicable laws and regulations and 
              specifically agree NOT to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Security Violations:</strong> Attempt to gain unauthorized access to any portion of the System, other user accounts, computer systems, or networks connected to the System through hacking, password mining, or any other means</li>
              <li><strong>System Integrity:</strong> Upload, post, transmit, or distribute any viruses, malware, trojans, worms, logic bombs, or other malicious code or software that may harm the System or other users</li>
              <li><strong>Interference:</strong> Interfere with, disrupt, or create an undue burden on the System, servers, networks, or security features</li>
              <li><strong>Data Harvesting:</strong> Use any robot, spider, scraper, or automated means to access the System or collect information about other users without permission</li>
              <li><strong>Fraudulent Activity:</strong> Impersonate another person, entity, or falsify your identity, age, or affiliation with any person or organization</li>
              <li><strong>Electoral Fraud:</strong> Engage in vote manipulation, ballot stuffing, voter intimidation, or any conduct that undermines the integrity of the electoral system</li>
              <li><strong>Academic Dishonesty:</strong> Submit plagiarized work, use unauthorized assistance during assessments, share login credentials to enable cheating, or engage in any form of academic fraud</li>
              <li><strong>Harassment and Abuse:</strong> Harass, threaten, intimidate, bully, stalk, or abuse other users through messaging, comments, or any System feature</li>
              <li><strong>Inappropriate Content:</strong> Upload, post, or transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, sexually explicit, or otherwise objectionable</li>
              <li><strong>Privacy Violations:</strong> Collect, store, or distribute personal information about other users without their explicit consent</li>
              <li><strong>Commercial Exploitation:</strong> Use the System for any commercial purposes, advertising, solicitation, or spam without written authorization</li>
              <li><strong>Copyright Infringement:</strong> Upload, post, or distribute copyrighted materials, trademarks, or proprietary information without proper authorization</li>
              <li><strong>False Information:</strong> Provide false, misleading, or inaccurate information during registration, profile creation, or any System interaction</li>
              <li><strong>System Manipulation:</strong> Manipulate attendance records, grades, payment information, or any other System data through unauthorized means</li>
            </ul>
            <p>
              Violation of any of these obligations may result in immediate termination of System access, disciplinary action, and 
              potential legal consequences including civil liability and criminal prosecution.
            </p>

            <h2 className="text-xl font-semibold text-foreground">5. Account Security and Credential Management</h2>
            <p className="mb-4">
              Users are solely responsible for maintaining the confidentiality and security of their account credentials, including 
              usernames and passwords. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Choose a strong, unique password that meets the System's security requirements</li>
              <li>Keep your password confidential and not share it with any other person</li>
              <li>Immediately notify school administration if you suspect unauthorized access to your account</li>
              <li>Log out from your account at the end of each session, especially when using shared or public computers</li>
              <li>Accept full responsibility for all activities that occur under your account</li>
              <li>Promptly update your account information if it becomes inaccurate or changes</li>
            </ul>
            <p className="mt-4">
              Kyengera Parents' School - Mugongo will not be liable for any loss or damage arising from unauthorized access to your account resulting 
              from your failure to maintain credential security. In the event of suspected account compromise, we reserve the right to 
              suspend access pending investigation.
            </p>

            <h2 className="text-xl font-semibold text-foreground">6. Data Protection and Privacy Compliance</h2>
            <p className="mb-4">
              Kyengera Parents' School - Mugongo is committed to protecting the privacy and personal data of all System users in compliance with 
              applicable data protection laws and regulations, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Uganda Data Protection and Privacy Act:</strong> Full compliance with national data protection legislation</li>
              <li><strong>Data Minimization:</strong> Collection of personal data only for legitimate educational purposes and administrative functions</li>
              <li><strong>Security Measures:</strong> Implementation of appropriate technical and organizational security measures, including encryption, access controls, regular security audits, and secure cloud infrastructure</li>
              <li><strong>Access Controls:</strong> Limited access to personal data on a need-to-know basis, with role-based permissions (student, parent, teacher, administrator)</li>
              <li><strong>Regular Updates:</strong> Continuous review and update of data protection practices to meet evolving standards and regulations</li>
              <li><strong>Breach Notification:</strong> Prompt notification to affected parties in the event of any data breach or security incident</li>
              <li><strong>Third-Party Processors:</strong> Ensuring that any third-party service providers maintain equivalent data protection standards</li>
            </ul>
            <p className="mt-4">
              For detailed information about how we collect, use, process, and protect your personal data, please review our comprehensive 
              Privacy Policy, which is incorporated into these legal terms by reference.
            </p>

            <h2 className="text-xl font-semibold text-foreground">7. Educational Records and FERPA Compliance</h2>
            <p className="mb-4">
              Student educational records maintained within the School Management System are protected in accordance with the Family 
              Educational Rights and Privacy Act (FERPA) principles and other applicable regulations governing educational records. 
              Access to educational records is strictly restricted to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Students:</strong> Students who have reached 18 years of age have the right to access their own educational records</li>
              <li><strong>Parents/Legal Guardians:</strong> Parents or legal guardians of minor students (under 18) have full access to their child's educational records</li>
              <li><strong>School Officials:</strong> Teachers, administrators, and staff members with legitimate educational interests and direct responsibilities</li>
              <li><strong>Authorized Representatives:</strong> Individuals authorized for audit, evaluation, or compliance purposes with appropriate approvals</li>
              <li><strong>Court Orders:</strong> Disclosure required pursuant to lawfully issued court orders or subpoenas, with notice to affected parties when possible</li>
            </ul>
            <p className="mt-4">
              Educational records include, but are not limited to: grades and assessment results, attendance records, disciplinary 
              records, health information, class schedules, assignment submissions, teacher evaluations, and any other information 
              directly related to a student maintained by the school.
            </p>

            <h2 className="text-xl font-semibold text-foreground">8. Content Submission and User Rights</h2>
            <p className="mb-4">
              When users submit, upload, post, or transmit content to the School Management System (including but not limited to profile 
              pictures, assignment submissions, forum posts, electoral campaign materials, comments, messages, and media files), you:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Retain Ownership:</strong> Maintain ownership of your original content and any intellectual property rights therein</li>
              <li><strong>Grant License:</strong> Grant Kyengera Parents' School - Mugongo a worldwide, non-exclusive, royalty-free, transferable license to use, reproduce, modify, adapt, publish, display, and distribute your content solely within the educational context and for System operation purposes</li>
              <li><strong>Warrant Authenticity:</strong> Represent and warrant that you own all rights to submitted content or have obtained all necessary permissions, licenses, and consents</li>
              <li><strong>Accept Responsibility:</strong> Accept full responsibility for the accuracy, appropriateness, legality, and integrity of submitted content</li>
              <li><strong>Consent to Monitoring:</strong> Acknowledge that submitted content may be monitored for compliance, safety, and security purposes</li>
            </ul>
            <p className="mt-4">
              Kyengera Parents' School - Mugongo reserves the right to remove, modify, or refuse to publish any user-submitted content that violates these 
              legal terms, school policies, or applicable laws, without prior notice or liability.
            </p>

            <h2 className="text-xl font-semibold text-foreground">9. Electoral System Legal Framework</h2>
            <p className="mb-4">
              The School Management System includes a comprehensive electoral platform for democratic student leadership elections. 
              The legal framework governing this system includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Eligibility Requirements:</strong> Strict adherence to established criteria for voter eligibility and candidate qualification as defined by school policies</li>
              <li><strong>Vote Security:</strong> Implementation of technical measures to prevent duplicate voting, voter fraud, and result manipulation</li>
              <li><strong>Ballot Secrecy:</strong> Protection of individual vote choices while maintaining system integrity and audit capabilities</li>
              <li><strong>Results Verification:</strong> Official verification and certification of electoral results by school administration before final publication</li>
              <li><strong>Dispute Resolution:</strong> Established procedures for addressing electoral complaints, irregularities, and contested results</li>
              <li><strong>Campaign Regulations:</strong> Guidelines for candidate campaigns, including content restrictions, fair competition requirements, and ethical conduct standards</li>
              <li><strong>Monitoring and Oversight:</strong> Administrative oversight of electoral processes with authority to intervene in cases of violations or irregularities</li>
            </ul>
            <p className="mt-4">
              Final decisions on all electoral matters, including eligibility disputes, vote validation, and result certification, rest 
              with the school administration. Participation in the electoral system constitutes acceptance of administrative decisions as 
              final and binding.
            </p>

            <h2 className="text-xl font-semibold text-foreground">10. Acceptable Use Policy for Digital Resources</h2>
            <p className="mb-4">
              The School Management System provides access to extensive digital resources including e-learning content (100+ videos), 
              digital library (500+ books), entertainment content, educational games, and communication tools. Acceptable use requires:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Educational Purpose:</strong> Primary use of all digital resources for legitimate educational, learning, and academic enrichment purposes</li>
              <li><strong>Appropriate Content:</strong> Accessing only age-appropriate and school-approved content, avoiding any material that is offensive, inappropriate, or prohibited</li>
              <li><strong>Copyright Respect:</strong> Respecting copyright protections on all digital materials, including videos, books, images, and multimedia content</li>
              <li><strong>Bandwidth Consideration:</strong> Using digital resources responsibly without excessive consumption that impacts system performance for other users</li>
              <li><strong>Citation Requirements:</strong> Properly citing and attributing digital resources used in assignments, projects, and academic work</li>
              <li><strong>No Redistribution:</strong> Not downloading, copying, or redistributing protected content beyond personal educational use as permitted</li>
              <li><strong>Parental Supervision:</strong> For younger students, parental guidance and supervision when accessing entertainment and recreational content</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">11. Communication Services Terms</h2>
            <p className="mb-4">
              The messaging and communication features of the System are provided to facilitate educational communication. Users agree that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>All communications must be professional, respectful, and appropriate for an educational environment</li>
              <li>The System is not to be used for personal social networking unrelated to educational purposes</li>
              <li>Messages may be monitored and reviewed for safety, security, and policy compliance</li>
              <li>Harassing, threatening, or inappropriate communications may result in disciplinary action and legal consequences</li>
              <li>Emergency communications should use traditional channels (phone calls) rather than relying solely on System messaging</li>
              <li>Privacy of communications is protected except where monitoring is necessary for safety, security, or legal compliance</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">12. Financial Transactions and Payment Terms</h2>
            <p className="mb-4">
              The System includes financial management features for fee tracking and payment processing. Legal terms governing financial 
              transactions include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Fee Obligations:</strong> Parents/guardians are legally responsible for payment of all assessed school fees as per enrollment agreements</li>
              <li><strong>Payment Methods:</strong> Accepted payment methods are specified in fee policies and may be updated periodically</li>
              <li><strong>Transaction Security:</strong> Security measures implemented to protect financial information, but users must also follow secure practices</li>
              <li><strong>Receipt Documentation:</strong> Official receipts are provided through the System, but users should maintain copies for their records</li>
              <li><strong>Dispute Resolution:</strong> Financial disputes must be addressed through the school's finance office with documented evidence</li>
              <li><strong>Outstanding Balances:</strong> Consequences for non-payment as specified in enrollment agreements and school policies</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">13. Attendance System Legal Considerations</h2>
            <p>
              The comprehensive attendance tracking system maintains legal records of student attendance. Important legal considerations include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Attendance records are official educational records subject to FERPA protections</li>
              <li>Accurate attendance reporting is required by educational regulations and is legally binding</li>
              <li>Parents/guardians are legally obligated to ensure student attendance as required by compulsory education laws</li>
              <li>Chronic absenteeism may trigger legal interventions including truancy proceedings</li>
              <li>Attendance analytics and reports may be used for official reporting to educational authorities</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">14. Termination of Access</h2>
            <p className="mb-4">
              Kyengera Parents' School - Mugongo reserves the right to terminate or suspend access to the School Management System immediately, without prior 
              notice or liability, under any of the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violation of these legal terms, school policies, or acceptable use policies</li>
              <li>Engaging in fraudulent, illegal, or harmful activities</li>
              <li>Compromising System security or integrity</li>
              <li>Harassment, bullying, or threats toward other users</li>
              <li>Academic dishonesty or electoral fraud</li>
              <li>Non-enrollment or withdrawal from the school</li>
              <li>At the request of law enforcement or government agencies pursuant to legal process</li>
              <li>Upon completion of studies or termination of employment for staff</li>
            </ul>
            <p className="mt-4">
              Upon termination, your right to use the System will cease immediately. Termination does not affect any rights or obligations 
              that accrued prior to termination.
            </p>

            <h2 className="text-xl font-semibold text-foreground">15. Dispute Resolution and Jurisdiction</h2>
            <p className="mb-4">
              Any disputes, controversies, or claims arising from or relating to these legal terms, the School Management System, or your 
              use thereof shall be resolved through the following escalation process:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li><strong>Initial Consultation:</strong> Direct consultation with relevant school officials (teachers, administrators, department heads) to seek informal resolution</li>
              <li><strong>Formal Complaint:</strong> Written complaint submitted to the Board of Directors outlining the specific issue, relevant facts, and requested resolution</li>
              <li><strong>Administrative Review:</strong> Formal review by school administration with opportunity for all parties to present evidence and arguments</li>
              <li><strong>Mediation:</strong> Good-faith participation in mediation through a mutually agreed-upon neutral third party</li>
              <li><strong>Binding Arbitration:</strong> If mediation fails, binding arbitration conducted according to the rules of the Uganda Arbitration and Conciliation Act</li>
              <li><strong>Legal Action:</strong> As a last resort, legal action in the courts of Uganda with exclusive jurisdiction in Kampala</li>
            </ol>

            <h2 className="text-xl font-semibold text-foreground">16. Governing Law</h2>
            <p>
              These legal terms, your use of the School Management System, and any disputes arising therefrom are governed by and construed 
              in accordance with the laws of the Republic of Uganda, without regard to conflict of law principles. You expressly agree that 
              exclusive jurisdiction for any dispute, claim, or controversy arising from these terms resides in the courts located in 
              Kampala, Uganda, and you further agree to submit to the personal jurisdiction of such courts.
            </p>

            <h2 className="text-xl font-semibold text-foreground">17. Amendments and Updates</h2>
            <p>
              Kyengera Parents' School - Mugongo reserves the right to modify, amend, or update these legal terms at any time to reflect changes in law, 
              System functionality, school policies, or operational requirements. Material changes will be communicated to users through:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Prominent notice displayed upon login to the System</li>
              <li>Email notification to registered user email addresses</li>
              <li>Announcement posted in the System's news or updates section</li>
            </ul>
            <p className="mt-4">
              Your continued use of the School Management System following notification of changes constitutes acceptance of the modified 
              terms. If you do not agree to the modified terms, you must discontinue use of the System and contact school administration 
              for alternative arrangements.
            </p>

            <h2 className="text-xl font-semibold text-foreground">18. Severability</h2>
            <p>
              If any provision of these legal terms is found by a court of competent jurisdiction to be invalid, illegal, or unenforceable, 
              such provision shall be modified to the minimum extent necessary to make it valid and enforceable while preserving its 
              original intent. If such modification is not possible, the invalid provision shall be severed from these terms, and the 
              remaining provisions shall continue in full force and effect.
            </p>

            <h2 className="text-xl font-semibold text-foreground">19. Entire Agreement</h2>
            <p>
              These legal terms, together with the Privacy Policy, Terms of Service, Cookie Policy, and Disclaimer (collectively, the 
              "Agreement"), constitute the entire agreement between you and Kyengera Parents' School - Mugongo regarding the School Management System and 
              supersede all prior or contemporaneous understandings, agreements, representations, and warranties, whether written or oral.
            </p>

            <h2 className="text-xl font-semibold text-foreground">20. Contact Legal Department</h2>
            <p>
              For legal inquiries, concerns, questions about these legal terms, or to report legal violations, please contact:<br /><br />
              Legal Department<br />
              Kyengera Parents' School - Mugongo<br />
              Kyengera Mugongo<br />
              Kampala, Uganda<br />
              Website: www.mugongo.sirapollokaggwaschools.co.ug<br />
              Phone: +256 753 616 792<br />
            </p>

            <p className="text-sm italic border-t pt-4 mt-6">
              <strong>Legal Notice:</strong> By accessing and using the Kyengera Parents' School - Mugongo School Portal, you acknowledge that you have 
              read, understood, and agree to be legally bound by these terms and all incorporated policies. These terms create legally 
              binding obligations, and your use of the System constitutes acceptance of this legal agreement. If you do not agree to these 
              terms, you must not access or use the System.
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
