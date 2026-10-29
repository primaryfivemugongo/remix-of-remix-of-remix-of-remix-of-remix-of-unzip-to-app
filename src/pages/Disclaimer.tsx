import { ArrowLeft } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/layout/Footer";
import { subDays, format } from "date-fns";

export default function Disclaimer() {
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
            <CardTitle className="text-3xl">Disclaimer</CardTitle>
            <p className="text-sm text-muted-foreground pt-2">
              Last updated: {lastUpdated}
            </p>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none space-y-6 text-muted-foreground">
            <p>
              The information contained in the Kyengera Parents' School - Mugongo School Portal (the "System") is provided for general information 
              purposes only. The information is provided by Kyengera Parents' School - Mugongo ("Kyengera Parents' School - Mugongo," "we," "our," or "us") 
              and while we endeavor to keep the information up to date and correct, we make no representations or warranties of any kind, 
              express or implied, about the completeness, accuracy, reliability, suitability, or availability with respect to the System 
              or the information, products, services, or related graphics contained within the System for any purpose.
            </p>

            <h2 className="text-xl font-semibold text-foreground">1. General Information Disclaimer</h2>
            <p>
              Any reliance you place on information provided through the School Management System is strictly at your own risk. We 
              disclaim all liability and responsibility arising from any reliance placed on such materials by you or any other visitor 
              to the System, or by anyone who may be informed of any of its contents.
            </p>

            <h2 className="text-xl font-semibold text-foreground">2. Academic Information and Records</h2>
            <p className="mb-4">
              All academic information displayed in the System, including but not limited to grades, attendance records, assessment 
              results, timetables, class schedules, and assignment submissions, is subject to verification and may be updated or 
              corrected as necessary. Important considerations include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Real-Time Data:</strong> While we strive for real-time accuracy, there may be delays in data synchronization affecting the immediate display of information</li>
              <li><strong>Official Records:</strong> Official academic records maintained by the school administration supersede any information displayed in the digital system</li>
              <li><strong>Grade Verification:</strong> Students and parents should confirm critical academic information, particularly final grades and examination results, with teachers and school administration</li>
              <li><strong>Attendance Accuracy:</strong> Attendance records are updated regularly but may require 24-48 hours for complete accuracy</li>
              <li><strong>Assignment Status:</strong> Assignment submissions and grades are processed according to teacher availability and may not reflect immediate updates</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">3. System Features and Functionality</h2>
            <p className="mb-4">The School Management System provides access to various features including:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Student dashboards, profiles, and academic tracking</li>
              <li>Teacher management interfaces and class administration tools</li>
              <li>Attendance tracking and reporting systems</li>
              <li>E-learning resources and educational video content</li>
              <li>Digital library access and book reservations</li>
              <li>Electoral voting systems for student leadership</li>
              <li>Communication platforms and messaging services</li>
              <li>Event calendars and school activity schedules</li>
              <li>Gallery and media sharing capabilities</li>
              <li>Finance and payment tracking features</li>
              <li>Analytics, reporting, and performance dashboards</li>
            </ul>
            <p>
              While we make every effort to ensure these features function as intended, we cannot guarantee uninterrupted or error-free 
              operation of all system components at all times.
            </p>

            <h2 className="text-xl font-semibold text-foreground">4. External Links and Third-Party Content</h2>
            <p>
              Through the School Management System, you may be able to access links to external websites, third-party educational 
              content, video platforms (including YouTube), entertainment content, and other external resources which are not under 
              the control of Kyengera Parents' School - Mugongo. We have no control over the nature, content, accuracy, or availability of those 
              external sites and resources. The inclusion of any links does not necessarily imply a recommendation or endorse the 
              views, content, or services expressed within them. We disclaim all liability for any content, advertising, products, 
              or other materials on or available from such external websites or resources.
            </p>

            <h2 className="text-xl font-semibold text-foreground">5. E-Learning and Educational Content</h2>
            <p className="mb-4">
              Our E-Learning platform provides access to over 100 educational videos, tutorials, and learning resources. Please note:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Educational content is provided as supplementary learning material and does not replace formal classroom instruction</li>
              <li>Video quality and availability may vary depending on internet connectivity and third-party platform status</li>
              <li>Content is curated for educational appropriateness but parental guidance is recommended for younger students</li>
              <li>External video platforms (such as YouTube) may display advertisements or recommended content beyond our control</li>
              <li>We do not guarantee the continuous availability of all linked educational resources</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">6. System Availability and Technical Issues</h2>
            <p className="mb-4">
              Every effort is made to keep the School Management System up and running smoothly. However, Kyengera Parents' School - Mugongo takes no 
              responsibility for, and will not be liable for, the System being temporarily unavailable due to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Technical issues beyond our reasonable control, including server failures, database issues, or network problems</li>
              <li>Scheduled maintenance periods, security updates, or system upgrades (notice will be provided when possible)</li>
              <li>Internet service provider disruptions or connectivity issues</li>
              <li>Cyber attacks, security breaches, or denial of service attacks</li>
              <li>Power outages, natural disasters, or force majeure events</li>
              <li>Issues with third-party service providers or cloud infrastructure</li>
              <li>Browser compatibility issues or user device limitations</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">7. Data Accuracy and Synchronization</h2>
            <p className="mb-4">
              While we strive to ensure that all data displayed in the System is accurate, current, and synchronized across all user 
              interfaces, users should be aware that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Information may be subject to change without prior notice</li>
              <li>Technical errors, data entry mistakes, or system glitches may occasionally occur</li>
              <li>Data synchronization delays may affect real-time accuracy across different user dashboards (student, teacher, admin)</li>
              <li>Official records maintained by school administration supersede any discrepancies in digital system data</li>
              <li>Automated notifications and alerts are provided as a convenience but should not be solely relied upon for critical information</li>
              <li>Attendance analytics and reports are generated based on available data and may require manual verification for official purposes</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">8. Electoral System Disclaimer</h2>
            <p className="mb-4">
              Our School Management System includes a democratic electoral voting platform for student leadership elections. Please note:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The electoral system is provided to promote democratic participation and student leadership development</li>
              <li>While we implement security measures to prevent fraud and ensure vote integrity, we cannot guarantee absolute security against all potential vulnerabilities</li>
              <li>Electoral results displayed through the system are preliminary and subject to official verification by school administration</li>
              <li>Technical issues during voting periods may necessitate extension of voting times or alternative voting arrangements</li>
              <li>Candidate information, applications, and campaign materials are the responsibility of the respective candidates</li>
              <li>Final decisions regarding electoral disputes or irregularities rest with school administration</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">9. Communication Services Disclaimer</h2>
            <p>
              The System provides messaging and communication features enabling interaction between students, teachers, parents, and 
              administration. Users acknowledge that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>We are not responsible for the content of messages sent between users</li>
              <li>Message delivery is dependent on system availability and user notification settings</li>
              <li>We reserve the right to monitor communications for safety, security, and policy compliance purposes</li>
              <li>Emergency communications should not rely solely on the System's messaging features</li>
              <li>Important school announcements will be communicated through multiple channels when possible</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">10. Entertainment and Media Content</h2>
            <p>
              The System provides access to educational entertainment content, including movies, games, and recreational materials. 
              Parents and guardians should be aware that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Content is curated for age-appropriateness but parental supervision is recommended</li>
              <li>Entertainment features are provided as supplementary recreational and educational enrichment</li>
              <li>We do not guarantee continuous availability of all entertainment content</li>
              <li>Third-party content providers may change availability, pricing, or access restrictions</li>
              <li>Gaming features (including Typing Wizard and educational games) are designed for educational purposes</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">11. Financial Information and Payment Processing</h2>
            <p>
              Financial information displayed in the System, including fee balances, payment history, and transaction records, is 
              provided for convenience and transparency. However:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Official financial records maintained by the school's finance department supersede digital displays</li>
              <li>Payment processing may be subject to delays depending on payment methods and banking systems</li>
              <li>Fee structures and payment schedules may be updated periodically as per school policies</li>
              <li>Disputes regarding financial matters should be addressed directly with the school's finance office</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">12. Professional Advice Disclaimer</h2>
            <p>
              The content in the School Management System is not intended to be a substitute for professional educational advice, 
              medical diagnosis, psychological counseling, or treatment. Information provided regarding student performance, 
              behavior, attendance, or development should be considered in consultation with qualified education professionals, 
              counselors, or medical practitioners when appropriate. Always seek the advice of qualified professionals with any 
              questions you may have regarding academic planning, student development, health concerns, or behavioral issues.
            </p>

            <h2 className="text-xl font-semibold text-foreground">13. User-Generated Content</h2>
            <p>
              Users may upload content to various sections of the System, including profile pictures, assignment submissions, 
              electoral campaign materials, gallery photos, and forum posts. Kyengera Parents' School - Mugongo:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Does not pre-screen all user-generated content before publication</li>
              <li>Is not responsible for the accuracy, appropriateness, or legality of user-submitted content</li>
              <li>Reserves the right to remove any content that violates our policies or applicable laws</li>
              <li>Cannot guarantee that user-generated content is free from errors, viruses, or malicious code</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">14. Analytics and Reporting</h2>
            <p>
              The System provides various analytics, reports, and performance dashboards including attendance analytics, academic 
              progress tracking, and electoral results. These analytical tools:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Are provided as informational aids and decision-support tools</li>
              <li>Should not be the sole basis for critical academic or administrative decisions</li>
              <li>May contain aggregated or anonymized data for privacy protection</li>
              <li>Are subject to the accuracy limitations of underlying data sources</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">15. Mobile Access and Device Compatibility</h2>
            <p>
              The School Management System is designed to be accessible across various devices including desktop computers, tablets, 
              and smartphones. However:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>We do not guarantee full functionality on all devices, operating systems, or browsers</li>
              <li>Some features may have limited functionality on mobile devices</li>
              <li>Users are responsible for ensuring their devices meet minimum technical requirements</li>
              <li>We are not responsible for data charges incurred through mobile access</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">16. Limitation of Liability</h2>
            <p className="mb-4">
              In no event will Kyengera Parents' School - Mugongo, its directors, employees, partners, agents, suppliers, or affiliates be liable for any:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of data, profits, revenue, business, or opportunities</li>
              <li>Service interruptions or system unavailability</li>
              <li>Errors, mistakes, or inaccuracies in content or data</li>
              <li>Unauthorized access to or alteration of user data</li>
              <li>Issues arising from third-party services, links, or content</li>
            </ul>
            <p>
              arising out of, or in connection with, the use of or inability to use the School Management System, even if we have been 
              advised of the possibility of such damages.
            </p>

            <h2 className="text-xl font-semibold text-foreground">17. Changes to Disclaimer</h2>
            <p>
              Kyengera Parents' School - Mugongo reserves the right to modify or update this Disclaimer at any time without prior notice. Changes will be 
              effective immediately upon posting to the System. Your continued use of the System following the posting of changes 
              constitutes acceptance of those changes. We encourage you to review this Disclaimer periodically for any updates.
            </p>

            <h2 className="text-xl font-semibold text-foreground">18. Governing Law</h2>
            <p>
              This Disclaimer is governed by and construed in accordance with the laws of the Republic of Uganda. Any disputes arising 
              from or relating to this Disclaimer or the use of the School Management System shall be subject to the exclusive 
              jurisdiction of the courts of Uganda.
            </p>

            <h2 className="text-xl font-semibold text-foreground">19. Contact Information</h2>
            <p>
              If you have any questions, concerns, or require clarification about this Disclaimer, please contact the school 
              administration at:<br /><br />
              Kyengera Parents' School - Mugongo<br />
              Kyengera Mugongo<br />
              Kampala, Uganda<br />
              Website: www.mugongo.sirapollokaggwaschools.co.ug<br />
              Phone: +256 753 616 792<br />
            </p>

            <p className="text-sm italic border-t pt-4">
              <strong>Important Notice:</strong> By accessing and using the Kyengera Parents' School - Mugongo School Portal, you acknowledge that 
              you have read, understood, and agree to be bound by this Disclaimer. If you do not agree with any part of this 
              Disclaimer, please discontinue use of the System immediately and contact school administration for alternative access 
              arrangements.
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
