import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "@/lib/router-compat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Vote, 
  UserPlus, 
  BarChart3, 
  Calendar,
  Users,
  Trophy,
  Clock,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { toast } from "sonner";
import { CandidatesSection } from "@/components/electoral/CandidatesSection";


export default function Electoral() {
  const navigate = useNavigate();
  const { user, userName, userRole, photoUrl, signOut } = useAuth();
  const [hasApplication, setHasApplication] = useState(false);
  const [userClass, setUserClass] = useState<string | null>(null);
  const [loadingUserClass, setLoadingUserClass] = useState(true);

  // Check eligibility based on class
  const canApplyForPosts = userClass && !['P1', 'P7'].includes(userClass);
  const canVote = userClass && userClass !== 'P1';

  const positionMappings = {
    "head_prefect": { title: "HEAD PREFECT", eligibleClasses: "P4-P5" },
    "academic_prefect": { title: "ACADEMIC PREFECT", eligibleClasses: "P5-P6" },
    "head_monitors": { title: "HEAD MONITOR(ES)", eligibleClasses: "P3-P5" },
    "welfare_prefect": { title: "WELFARE PREFECT (MESS PREFECT)", eligibleClasses: "P4-P5" },
    "entertainment_prefect": { title: "ENTERTAINMENT PREFECT", eligibleClasses: "P2-P5" },
    "games_sports_prefect": { title: "GAMES AND SPORTS PREFECT", eligibleClasses: "P4-P5" },
    "health_sanitation": { title: "HEALTH & SANITATION", eligibleClasses: "P3-P5" },
    "uniform_uniformity": { title: "UNIFORM & UNIFORMITY", eligibleClasses: "P2-P5" },
    "time_keeper": { title: "TIME KEEPER", eligibleClasses: "P4-P5" },
    "ict_prefect": { title: "ICT PREFECT", eligibleClasses: "P3-P4" },
    "furniture_prefect": { title: "FURNITURE PREFECT(S)", eligibleClasses: "P3-P6" },
    "upper_section_prefect": { title: "PREFECT FOR UPPER SECTION", eligibleClasses: "P4-P5" },
    "lower_section_prefect": { title: "PREFECT FOR LOWER SECTION", eligibleClasses: "P2" },
    "discipline_prefect": { title: "PREFECT IN CHARGE OF DISCIPLINE", eligibleClasses: "P3-P5" },
  };

  // Check if user has already applied and get user class
  useEffect(() => {
    const checkApplicationAndClass = async () => {
      if (user?.id || userName) {
        try {
          // Get user's class information
          const { data: studentData, error: studentError } = await supabase
            .from('students')
            .select('id, class_id')
            .eq('id', user?.id || userName)
            .single();

          if (studentError) throw studentError;

          if (studentData) {
            const { data: classData, error: classError } = await supabase
              .from('classes')
              .select('name')
              .eq('id', studentData.class_id)
              .single();

            if (classError) throw classError;
            setUserClass(classData?.name || null);
          }

          // Check for existing application
          const { data, error } = await supabase
            .from('electoral_applications')
            .select('id')
            .eq('student_id', user?.id || userName)
            .single();
          
          setHasApplication(!!data);
        } catch (error) {
          console.log('Error fetching user data:', error);
          setHasApplication(false);
        } finally {
          setLoadingUserClass(false);
        }
      }
    };
    
    checkApplicationAndClass();
  }, [user, userName]);

  // Election phases and countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    microseconds: 0
  });
  const [currentPhase, setCurrentPhase] = useState<'applications' | 'voting' | 'results'>('applications');

  useEffect(() => {
    // Election phases
    const applicationsEnd = new Date('2024-09-30T16:00:00+03:00').getTime(); // Applications ended
    const votingStart = new Date('2025-01-01T08:00:00+03:00').getTime(); // Voting started Jan 1, 2025
    const votingEnd = new Date('2026-12-31T16:00:00+03:00').getTime(); // Voting ends Dec 31, 2026
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      
      if (now < applicationsEnd) {
        // Applications phase
        setCurrentPhase('applications');
        const difference = applicationsEnd - now;
        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          const microseconds = Math.floor((difference % 1000) * 1000);
          setTimeLeft({ days, hours, minutes, seconds, microseconds });
        }
      } else if (now < votingStart) {
        // Between applications and voting - waiting for voting to start
        setCurrentPhase('voting');
        const difference = votingStart - now;
        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          const microseconds = Math.floor((difference % 1000) * 1000);
          setTimeLeft({ days, hours, minutes, seconds, microseconds });
        }
      } else if (now < votingEnd) {
        // Voting phase - active voting period
        setCurrentPhase('voting');
        const difference = votingEnd - now;
        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          const microseconds = Math.floor((difference % 1000) * 1000);
          setTimeLeft({ days, hours, minutes, seconds, microseconds });
        }
      } else {
        // Results phase
        setCurrentPhase('results');
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, microseconds: 0 });
      }
    }, 10); // Update every 10ms for microseconds

    return () => clearInterval(timer);
  }, []);

  // Calculate dynamic stats
  const totalVoters = useMemo(() => {
    // Actual student data from the school (excluding P1 as they cannot vote)
    const studentData = {
      "P2": {
        "GOLDEN": ["ABAHO FIACRE EUGENE", "ADIL KIVIIRI MITTI", "AGASHA ABIGAIL", "AHURIRE JONATHAN", "AINEBYONA GABRIELLA ALINDA", "AKAMPULIRA ARISTARCHUS SAMUEL", "ALUMA AARON", "ASHABA ABIGAIL CHLOE", "ATUKUNDA SALOME", "AYONGYERAHO SAMANTHA", "BUKENYA POWEL JUNIOR", "BYAMUKAMA MULUNGI RHODAH", "GANZA HOLLY SHAK", "GITTA JAMAL", "HIRWA TETA HUGUETTE", "JJUUKO DRAKE PUIS", "KABUYAYA SHANNA", "KATO JESSE", "KATUMBA WALLACE MUGERWA", "KAYANJA DALTON", "KIJJAMBU GRACE", "KIRENDA HAVANS KERAMO", "KISAKYE ELIANA TENDO", "KISITU TREVIS STEVEN", "KITENDA GIAN MUKIRIZA", "KIYAGA HADIJAH", "KUBAGYE ISAIAH", "KUNDHUBA LEVITICUS MIGUEL", "KWAGALA GRAHAM", "LUBOWA ABDUL KARIM", "LUTAAYA JORDIN SAAVA", "LWASA DAVIS", "MAGUMBA SHAMYRAH", "MAWEJJE EXPERITO", "MAYANJA FABIAN VANVAN", "MBOGGA JOEL", "MIREMBE LUCY FLAVIA", "MUHOZA PRAISE", "MUSIITWA MARCUS FRANCIS", "MUWANGA HAIMA AADIHA", "MUWANGUZI CHRIS DANIEL", "MWEBIGWA ELIJAH", "NAJJUUKO NALUZZI", "NAKAAYI ABIGAIL", "NALUJJA TIMAYA", "NAMULINDWA MIRACLE", "NANKYINGA SHANNEL MARIA", "NASSALI BASHIRAH JOY", "NATUHWERA ABIGAIL KATONGOLE", "NAZZIWA ELIANA GRACE", "NUWASIIMA ELIJAH JUNIOR", "RUGABA CAESER", "SSEBBUMBA ISAAC IQRAM", "SSEGAWA JORAM", "TIBANYAGA GENESIS", "ZAWEDDE NADRA"],
        "KITES": ["AGUTI MATINA", "AKATUKUNDA TRIUMPHANT", "AMIR ADAMS KYEYUNE", "ATUHURA TRISHA LINATE", "ATULINDA CLARA MERISHA", "BALAM EDITH LUGOJA", "CYOGERE JAYDEN MUVARA", "EKYE AKMAL PRICELESS", "EKYE KAMAL", "KABAGAMBE SPEEDMAN JESUS", "KALULE CATHERINE VANNAH", "KHIISA PETRONELLA", "KIRUNDA EMMANUEL KWAME", "LAKER LIZETH", "LUMU DAGLOUS LUCKY", "LUSIBA JONAH", "LUTAAYA JOHN WYCLIFF", "LUZINDA ELIJAH KISAKYE", "MUGAMBE TYRONE", "MUGARURA SHAROT", "MUHUMUZA NEWTON", "MUKISA TREASURE", "MULUMBA MELISSA MICHELLE", "MULUNGI MACKYLA", "MUYOMBA PAMELLA", "NABAALE MARIA MACKEILA", "NABATANZI BLESSING", "NABATANZI MARIA", "NABAYEGO MARTHA ARIANA", "NABUKEERA MARTHA BETTY", "NABUMBO BEATRICE", "NAGADYA WENDYWEEKS", "NAKALINZI VICTORIA NABBIMBA", "NAKAYIWA BLESSING", "NAKIGUDDE JESCA", "NALWADDA MARIANAH", "NAMAGANDA MARY MUBEEZI", "NAMAGEMBE ABIGAIL KIRABILA", "NAMATA PRISCILLA SHALOM", "NAMBUUSI FIRIDAUS", "NAMBUUSI VERONICA NAKATO", "NANSUBUGA KELSIE", "NANTIMBA JULIAN SEKATE", "NASSANGA RIDAH BASINGA", "NENDEJYE MARION", "NGOGE VIVIAN", "OPI HIRAM ANISON", "RABEIA ABDALLAH HAMED", "SSEGAWA CLYDE LARKIN", "SSEGUJJA DAVASHA LOVE", "SSENTONGO JEMIMAH PRECIOUS", "YAWE AMBER HADIA"],
        "MARIGOLD": ["ABIGABA MATTHEW", "ABIGARURAHO SPLENDID", "ACHOLA SAMANTHA", "AHIMBISIBWE JEREMIAH", "AHIMBISIBWE KEVIN", "ALIGUMA EMILLY", "ALINDA TIFFANY", "ANZOA FAITH", "ATAI KAYLAH ARINDA", "ATUHAIRE TRACY KARUNGI", "ATUHIRE ANNA MARY LORETTA", "BIRUNGI KIMORA", "BYARUHANGA TRACY", "KAGIMU JESHAIAH MELODY", "KANYI MPAKANYE MAURICE", "KASIRYE BADURIAH", "KASOZI CYRUS MUBIRU", "KAVUMA LIBERTY", "KIGGUNDU FRANCIS EXAVIER", "KIGOZI CALVIN", "KIMBUGWE MUHAMMAD ALI", "KIMERA JERICHO", "KIMULI ELIJAH", "KOBUSINGYE NATALIE", "KYOBE JOSIAH MULUNGI", "LAKICA ABIGAIL CHLOE", "MAGUMBA JAHIM", "MUGERWA EDRINE", "MUKISA HAM", "MUKISA JEREMIAH", "MULUNGI ASHER NTWALI", "NABIRYE LAILAT", "NAKYANZI CHLOE MALAIKA", "NAKYEYUNE MARIA DARLEN", "NAMIREMBE JUSTINE NATALIA", "NAMPIJJA RAHUMAH", "NAMUKASA CLAIRE", "NANTULYA EZRA", "NDAGIRE SHANER RANISH", "NDAHIRO BRIAN", "NIWAGABA DIVINE", "NTEYERA ABIGAIL ZITA", "NYANZI PRESTON", "OLA CHRISLEY", "OMENO MAURICE JUNIOR", "ONYIRU JOY ECOKU", "OWAMAHORO RAUTHA", "SAKA RAHIM SUNDAY", "SSEKANJAKO TRAVIS VIANNEY", "WANDERA GARY JOSIAH", "WASSWA JORDAN"]
      },
      "P3": {
        "CRANES": ["AINE FLOKI", "AINOMUGISHA PURITY", "AKANDWANAHO MOBERT", "ALOYO JIREH OKOT", "ALPHA SADIKI", "AMODING DORCAS LAURETTA", "ANKUNDATRICIA", "ANYOLE JAAD GALA", "ARINAITWE DYLAN GIFT", "ARINDA LINDSAY", "ARIO VICTORIA PRETTY", "ASASIRA PHILLIP PROSPER", "ASIIMWE ERINAH MERCY", "ATUHIARE ELLAH MUHABWE", "AYEBALE LUCKY", "BAGALA LETICIA KAKYUBYA", "BBOSA CYRUS RICH", "GALABUZI FARHAN", "ISHIMWE NGIRISOKO DEBORAH", "ITUNGO PHILLIP ROMEO", "KABUGO ALPHA DICKENS SHINE", "KALEMA ELVIS SSEJINJA", "KAMYUKA RYAN", "KASOZI MOSES DALTON", "KAWEESI MELVIN", "KAZOOBA CHARLES", "KIMBUGWE TAPHATH KIRABO", "KIYAGA EMMANUEL", "KOBUSINGE LAURITAH", "KWAGALAKWE TRINITY DIVINE", "MAGALA VICTOR PRINCE", "MARIA IVY LUSWATA", "MAYIGA FRANCIS", "MFURAKOZI ELIZABETH", "MUGALU ETHAN MBOWA", "MUGANWA GABRIEL ECKOUGHT", "MUHOZA SOPHIE GIFT", "MUTESI FAIZER NAMULONDO", "MUWANGUZI CALVIN", "MUYOMBA KEVIN", "NABUTONO PURITY", "NAGAWA ELLA ANNA", "NAKAJIRI JACKLINE CLARICE", "NAKATO BLESSED ABIGAIL", "NAKAWOOYA DIVINE", "NAKAYIZA MILKAH", "NAKIBUYE ELIZABETH", "NAKIBUYE ERIKA", "NAKIREMBEKA RUTH TENDO ESTHER", "NALUBEGA NELLYN", "NAMATOVU ABIGAIL SHANEL", "NAMATTA JOSELYN CELYN", "NAMIGADDE KIRABO SHAMIRAH", "NAMIREMBE ELIANAH", "NAMULI ADONAI", "NANFUKA SYLIVIA", "NANGOBI FAVOUR RIHANA", "NANSAMBA MARTHA MELINA", "NDAGIRE GENESIS PERUTH", "NGELESE RIAM VIANNY", "SSAAZI WYNAND RAUBEN", "SSEGUYA SHAFIC", "SSEKITO MUNIRA", "WASSAJJA DICKENS CHARLES", "WASSOZI CALVIN RASHFORD", "WASSWA DOUGLAS"],
        "PARROTS": ["ACEN ANNABEL CAISEY", "ADAM SAMA MOKHTAR", "AGABA JOHN AUSTIN", "AKAMPULIRA CATALEYA RUTH", "ALIMPA DESTINY ANGELLA", "AMJAD YASIR KASIRYE", "ANYIJUKIRE FAVOUR DOLLARS", "ARISHABA ELIJAH KAHANJIRWE", "ASINGUZA JOLLINE", "ATUHAIRE PRAISE CYNTHIA", "ATUKUNZIRE SPLENDOR", "AWADI BENTI SALAH", "BAINOMUGISHA ABIDAN", "BANADDA HUMAIRAH", "BBEMBA SOLOMON DALTON", "BUKENYA IMRAN", "BUSHIRAH HAKIM", "DDAMULIRA AMANI KISIRINYA", "DDUMBA CANAAN KISAKYE", "JOHN KEELY KUTEESA", "KAZIBA ERIAS", "KIRABO KEISHA", "KYOBE HEAVENS MACKYLINE", "MASSA RAHUMA", "MATOVU KEITH", "MAYIGA SADAT", "MUGERWA MARVIN KITIIBWA", "MUGISA VALERIE", "MUGISHA HARVEST", "MUHOOZI ABRAHAM", "MUKISA BRINAH AISHA", "MUKISA SEAN", "MUKOOTA SHAREN", "MUSIBIKA SHAHIDAH", "MUTAAWE MARJORINE", "NABAGULANYI RHONAH", "NABUUMA EVELYN", "NAGGAYI GLORIA", "NAGUJJA MELLISA", "NAKACWA SYNTHIA", "NAKAFEERO CHLOE KATRINAH", "NALUGGWA JULIANAH", "NALUSOZI MADRINE", "NAMBUUSI HASIFA LULE", "NAMPEEWO RHAUDAH", "NAMUDDU JULIET NALUSIBA", "NANTEZA JULIAN TENDO", "NANYANGE EMMANUELLA", "NANYUNJA ANGEL MYRA", "NASSUUNA ANNA CHLOE", "NGABO ETHAN MAZINGA", "NINSIIMA MARY MERCY", "NSUBUGA ETHAN SAMUEL", "NYANGOMA MARIANA MELISSA", "SANYU LOUIS", "SSALI JORDAN", "SSEKYANZI DAVAN", "SSEMWANGA RODNEY", "SSEMWOGERERE SADDAM", "TUMUHAISE BENJAMIN", "WODERO JONATHAN"],
        "SPARROWS": ["ABAASA ALVIN", "ABAASA BENJAMIN", "ABDUDALLAH AZIZ KIZZA", "AGABA RUGABA SOLOMON", "AIJUKA ELYNET", "AINEMABABAZI AMELIA", "ALINDA ETHAN", "AMORAH BLESSING", "APIYO ABIGAIL CAIRA", "ATWIINE JESSE BYAMUKAMA", "BAFUWE JOSIAH SIMON", "BAKYAZI ZULPHER", "BALIRUNO ARTHUR MUWANGUZI", "CHIOMAKA NASHIELLY ABIGAIL", "EMMANUELLA CON", "INEZA CANDICE", "KABALI NICHOLAS VICENT", "KABBALE MARK BERNARD", "KAKANDE ROMANS", "KALWAZA JAMES AHURIRE", "KARUNGI PRECIOUS", "KASIRYE BASHIRAH", "KASOZI TRAVAN MUWONGE", "KATENDE DALDAH NAEMU", "KEMBABAZI ELEXANA", "KIGOZI ABDUL SHAKUR", "KIRYOWA ALOYSIOUS", "KISAKYE PAULINE DELISHA", "KWAGALA DIVINE SSEBUGUZI", "LAGUM NICHOLETTE", "LUMU ANDREW", "LWANGA SHAFIK BASUDDE", "MATOVU JOHN HEIDEN", "MATOVU MICAH", "MBABAZI HILTON MIREMBE", "MILLA MIRACLE TIMOTHY", "MPAIRWE LESLEY LEONAH", "MUHUMUZA GRACE MUTONI", "MUKAMA LIAM JONATHAN", "MUKIIBI VIANNEY", "MUTONI ELISHEBAH ALISON", "MUWONGE LUCKY JONATHAN", "NAKIWALA MALAIKA HAZEL", "NALUBEGA DINAH", "NAMBOGO CHRISTABEL", "NAMIIRO MONICA CLARA", "NAMUGGA VALERIA", "NANDAWULA MIRIAM", "NASSOZI VALORIE BLESSINGS", "NDETESHEKO GIFFIN GIDEON", "NOKRACH KEYLOR CRUZ", "NSHUTI ELISHA", "NTARE MAURICE NABLE", "NUWAGABA AARON SHELDON", "NYAKATO MARIA MICHELLE", "NYOMBI AMIRA", "NZIZA ELIJAH", "OKOT ADRIEL HISGRACE", "OKOTEL EMMANUELLA", "OMODING ETHAN EYALAMA", "ROHAAN BAHAR", "SSANGO JOVAN ANGELLO", "SSEBUGWAWO JONATHAN KISLEV", "TOMUSNAGE KATRINAH", "WALAKIRA ALOYSIOUS", "WALUKAGGA SALIM", "WASSWA ABEL BRANDON"]
      },
      "P4": {
        "EAGLETS": ["AKAMPURIRA CALVIN", "ANKUNDA DONALD", "BESIGYE TRICIA", "BUGEMBE SHAKUR DDUMBA", "BUKENYA KRYSTAL NOEL", "BWIRE EMMANUEL", "BYARUHANGA ASHNAZ", "DDUMBA JORAM", "HIRWA ALLE IAN", "ISINGOMA EDGAR", "KAFEERO ELIJAH PASCAL", "KAGIMU SHEMAIAH GOODLUCK", "KAITESI LEAH", "KAKINDA FABIAN", "KAMUGISHA GIOVANA", "KASIITA UMARU", "KAVUMA AMIR", "KAWEESI ABDUL SHAKUR", "KAWEESI EVANS", "KEEYA MALCOM", "KIBUDDE NICHOLAS", "KIGULI NAILOR", "KISIRA JORDAN", "KYEYUNE DANIEL", "LUBEGA MICHEAL  MALCOM", "LUTAAYA CATHERINE", "LWALANDA HAKIM", "LWASSA DALTON ELIJAH", "MAGALA DALTON EDWARD", "MAGUMBA SHAKIR", "MIGADDE SHAKUR SUCCESS", "MPAIRWE SERENE LYTON", "MUGERWA JERICHO", "MUKIIBI JONATHAN", "MUKISA FAVOR", "MUKISA FAVOUR", "MUKULU MAHAD NASSIB", "MUWAMBA WILFRED", "NABUKEERA SHUKRAN", "NAKABUYE CYNTHIA", "NAKALANZI PROMISE", "NAKASIISA SHEILLA KABOGGOZA", "NAKIBONEKA PRUDENCE", "NAKIGULI SHIVAN", "NAKITTO RHONEL RUTH", "NAMAGALA EDRON JOAN", "NAMBEJJA CHRISTINE", "NAMUBIRU AFRICA RACHEAL", "NAMUYIGA JOVIA", "NAMYALO TASHEEMIM", "NANJEGO VICTORIA", "NANKUBUGE SHAINAH", "NANNUNGI ANNA PRECIOUS", "NANTEZA LYAN", "NASASIRA DIVINE", "NASIMBWA CIARA NANA", "NASSIMBWA GRACE HANNAH", "NKWISANA REAGAN", "OLA KERON MICHELLE", "RASHMY WAHIDAH IMAN", "SEKATE GODFREY JUNIOR", "SSEBUUFU RAYMOND", "SSEKAJIGO VICTOR", "SSERUYANGE TIMOTHY", "SSIMBWA TALIQ", "TUMUSIIME FRANCIS", "TURYAKIRA TYRONE", "WAIKYA ISRAELLA PHOENIX", "WALUSIMBI JETHRO VALENTINE"],
        "BUNNIES": ["ABAASA MELISA", "AGABA JOHN TREASURE", "AHUMUZA PRAISE ROBERT", "AINEMBABAZI GRACE REINAH", "AINEMBABAZI MELISA", "AKAMUTUHA JANET", "AKWERO LYN AUSTINE", "AMILAH ADAMS KYEYUNE", "ANVIKO SHANTAL MARION", "ARIIHO ISRAEL", "ARINDA MARTHA ELLONY", "ATUHAIRE GEORGIA ROSE", "BALIKUDDEMBE ELVIS", "BARUNGI VICTORIA", "BATANDA JETHRO", "BUYONDO ISRAEL", "ELOY TITUS SSENTONGO", "IRENE MALAIKA NABBAALE", "KABAGAMBE WEISSMAN", "KAKUNGULU RYAN MARK", "KALIBBALA AKRAM", "KALYANGO RAHEEM", "KATO JOVANS KABUYE", "KATUMBA CONRAD", "KATUMBA MARIA", "KAVUMA NORINE ESTHER", "KAWEESA KEIRAN", "KAWEESI HASHIM SSESSAAZI", "KIMBUGWE ABDALLAH", "KOMUJUNI FEDRACE", "KWEZI ROBINS", "MAGOMA BELICIA", "MALAIKA TRIXIE KIYAGA", "MIREMBE RAUDAH", "MUKIRIZA GEORGE MBOOWA", "MULUNGI ASABA JOANNAH", "MUSIIME GIFT", "MUYAMA ABIGAIL", "NABBONGOLE KATRINAH", "NABUKENYA JOSEPHINE KATE", "NAKALUNGI GABRIELLA IVANNAH", "NAKASUMBA ANITAH", "NALUBEGA MARIA", "NALUYANGE MADRINE DOROTHY", "NALWANGA JAZMINE", "NAMAGANDA BRIANNAH STEPHANIA", "NAMANDA MAJORIE", "NAMAZZI DESIRE HILDA", "NAMPIIMA PAULINE", "NAMUGERWA SABRINA", "NAMUJJUZI WINFRED", "NAMULI COMFORT", "NAMUTEBI LEONAH ROSELLA", "NANSUMBI DEBORAH KENDRA", "NANYUNJA RINAH NANA", "NASIRUMBI ISABELLA", "NDAGIRE SARAH", "NTAMBI REAGAN", "NYAKATO EDRINA", "SANYU NISHA GASARO", "SSEMPIJJA OSCAR", "SSEWANYANA AARON", "TAMALE JOHN FRANCIS", "TREASURE ELIZABETH SEKU", "TUKUNDANE EUGENE", "WALUSIMBI MARTIN", "WASSWA JONATHAN KABUYE", "WOSERO JOSHUA"]
      },
      "P5": {
        "SKYHIGH": ["AKOL LEON MASABA", "ASIIMWE MONICA", "ATUHAIRE ANGELLA", "BAKINDO SIMON SALA", "BANADDA HASHIM", "BUKIRWA RAHMA DDUMBA", "CHOL GAI ALIER NHIAL", "KAWULUKUSI SHAKURAN", "KAYAGA KATRINAH", "KEBIRUNGI DAISY EVE", "KIGGUNDU FAVOUR MARCUS", "KIGOZI RAHEEM", "KISAKYE MARTHA", "KWAGALA FAITH JOY", "LUMU ANNA GRACIOUS", "MATSIKO HANIF", "MAWEJJE UKASHA", "MBABAZI CYRON", "MBAZIIRA JOEL", "METALORO MARY PURITY", "MIKKA TYABA NICHOLAS", "MPANGA FAHAD", "MUBIRU INAN", "MUBIRU MIGUEL HERO", "MUKASA BRYTON", "MUKIIBI MICHEAL", "MULUMBA FAVOUR CLINTON", "MUTESASIRA JOLLENE", "MUTESI TRINA TEDDY", "NABAGEREKA CHRISTINE MELANIE", "NABAGULANYI TENDO TREASURE", "NAKAWOOYA TEACILAM MUYINGO", "NAKIBUUKA ASSUMPTA", "NAKIBUULE MELAN BLESSED", "NAKIGANDA LISA", "NAKITTO HAPPY DANIELLA", "NAMATOVU IMMACULATE", "NAMATOVU PROVIA ABIGAIL", "NAMATOVU SHUKRAN", "NAMAYANJA ANTONIO MERCY", "NAMULEMA MERCY ALLEN", "NAMULINDWA VICTORIA", "NAMUTALE FEDERICO", "NANTONGO SHANTEL", "NIMUKUNDA CYRUS MURAMIRA", "NSAMBA JORDAN RICH", "SSEJJUUKO PEDRO", "SSEKANJAKO ARAFAT", "SSETUMBA JESSIE", "TUSUBIRA ARTHUR", "WASSAJJA MELISSA RAY"],
        "SUNRISE": ["ADAM SALAMA MOKHTAR", "AHEREZA HONOUR MULUNGI", "AINOMUGISHA ANGEL", "ALIYAH ADAMS KYEYUNE", "ASHABA ELIZABETH", "BAGONZA JOAB", "BLESSING SHILOH", "BUKIRWA SHILOH", "BUYUNGO BRANDON ERIC", "IRANYA MARCUS", "KAKONA JORDAN KASH", "KALULE CAESER CARLOS", "KASOZI AAMRAT", "KEMIGISHA ALEXANDRIA", "KIGGUNDU LUKE", "KISMART DAUDA", "LUBEGA MALCOM EMMANUEL", "LUGYA AKRAM", "LUYIGA RAYAN", "MANZI EVANS", "MUBEEZI SHADIA LUYIGA", "MUHUMUZA ADELITO", "MULANGIRA JOSEPH", "MULUNGI IAN", "MUYIZA SYRUS", "NABIRYE PRECIOUS", "NABUUMA VANESSA", "NAKAWEESI MICHELLE", "NAKUNGU PRECIOUS CYNTHIA", "NAMAGANDA IMRAH SSEMPIJJA", "NAMAKULA SOPHIA KITIIBWA", "NAMIREMBE ALPHA DDAMULIRA", "NAMUTEBI GETRUDE", "NAMWANJA JOHNBAPTIST", "NANJOBE VANESSA", "NANSUBUGA MANNUELLAH", "NANTONGO BUSHIRA", "NANUNGI DRUCILA LUTEETE", "NASSANGA MARIA VIENNA", "NICHOLAS ITAAGA TRUST", "NINSIIMA MARY SHALOM", "NVANUNGI SHANIEZ", "PHILLIP DAVID LUKANDWA", "RWOMUSHANA OMUGISHA GABRIEL", "SSEBABENGA KERON", "SSEMATIMBA MARK", "SSEMOMBWE ANDERSON", "SSENGENDO PRITA", "SSEWAKIRYANGA HOSEA", "SSUUNA RAFAN WASSAJJA", "TEMITOPE ABOSODE", "TENDO HASIFA HAKIM", "TWESIGE ADRIAN", "UWINEZA SHAMAH ZINDUKA"],
        "SUNSET": ["AINEBYONA ISAIAH", "ANKUNDA DENISE", "ANYANGO KAREN MERCY", "ASIIMWE SHEENA", "ATAMBA CAROL JIREH", "ATUKUNDA GRAMIA", "AYEBAREYESU EXCELLENT", "BWIRE CLARISSA SUCCESS", "DDUMBA FRANCIS", "GITTA RAZAQ", "HIPAINGAH SALAH JOSEPHINE", "INEZA PEACE DORIAN", "JIBE IMMACULATE", "KABUYAYA RAYANNA", "KAKANDE BLESSED", "KAMUGISHA NATALIE", "KATEREGGA RASHIM", "KATEREGGA RAUL", "KAVUMA LORINE GRACE", "KAYEMBA SHAN", "KHARUNDA ESTHER", "KIMBUGWE MELVIN ELISHA", "KIRABIRA ARNOLD", "KITANDWE ABDULSHARKUL", "KUTEESA ISMAIL KALULE", "LWANGA RAPHAEL NAMPAGI", "LYMIAH AVRIL SALIM", "MATENYITIA MERCY", "MICHORO ANNA ALEX", "MOYA ELISHA", "MUGISA VALENTE CURTIS", "MUKISA SAMSON", "MULINDWA EDDY", "MURAMUZI JAN_JENSEN", "NABAKOOZA CHRISTINE", "NABIKOLO ANNA", "NAJIB ALSHAFIQ", "NALUMANSI LYTON", "NAMALA SALASBEL", "NAMBI NAAVA", "NANDAWULA DESIRE", "NANONO ROSHAN ISMAIL", "NINSIIMA ALIANAH KIRABO", "NYONYOZI EDRINAH SKYLER", "SSEKANDI RAMADHAN", "SSONKO HENRY ARTHUR", "UMUTESI DINAH INEZ", "WALUSIMBI ABDUL SHARIK"]
      },
      "P6": {
        "RADIANT": ["ABAHO FARRELL", "AINEMBABAZI ELIANAH", "ARIHO CALVIN", "ATUHAIRE COMFORT", "ATUHAIRE PROMISE", "ATWIINE RUTH", "AYEBALE ABORIGINE", "BUKENYA SHADRACK", "ELIANA TREASURE MUKISA", "KABUYAYA TATIANA", "KAKOOZA JUMA KAGGWA", "KIDHUUBO PATRICIA GLADYS", "KIMBUGWE TIMOTHY", "KISAWUZI PROSPER JONATHAN", "KIWANA GENEROUS", "KIYAGA TERRY ELIJAH", "KIZITO ISAIAH", "LUBOWA SHANITAH", "MURUNGI SHAREEF RAUSHAN", "MUTANDA LEON ARTHUR", "MUWANGUZI JEREMIAH ANKUNDA", "NAJJINGO TEOPISTA KALUNGI", "NAKANDI ROCINTA", "NAKINTU RAMLAH", "NAKYANZI BENINA", "NAMATA DIVINE HANNAH", "NAMITALA TONNIA", "NAMUTEBI LETICIA", "NAMYALO CLARA KETRA", "NANKYA NUSRAH", "NSUBUGA ERON", "NSUBUGA MATILDA YULLIANA", "OMAR ROSHEEN NSEGIMAANA", "PARA PATRINA", "RUGUMAYO JOSEPH REMIGIUS", "SANGA FAITH LISA", "SSEKATAWA CLANCY CALVIN", "SSENYONJO SEAN ADRIAN", "TALIDDA SARAH", "WALUGEMBE JONATHAN", "WAMALA CHESTNUT", "YIGA INNOCENT"],
        "VIBRANT": ["ADITE DIRAN", "AKATUSIIMA RAVEN", "ANZOA JOVANNAH", "ATURINDA KELTON", "BALUKU ELEUTHERIUS BROGAN", "BUGINGO JORAM", "ITUNGO ISOBEL AYETA", "KABISWA ISAAC", "KALUNGI DAVID", "KATUMBA MARTHA", "KIRABO MADRINE PRINCESS", "KIWENDO CALVIN", "KYOMUGISHA ETHEL HANNAH", "LUYIGA RAHIM", "MAYITTO CHRISTIAN", "MIREMBE GIFT REBECCA", "MIRIMU ELIJAH", "MUBARAH RANIAH YAIZD", "MUGARURA PAXTON", "MUGENYI RYAN", "MUKIIBI JOSEPH", "MUKISA SHAMMAH", "MURUNGI AARON", "MUSIIMENTA HANNAH AMITO", "MUTEBI JORDAN DIEGO", "MUWANGUZI ETHAN", "NABACHWA SHIVAN", "NABUKENYA TYRA", "NAJJINGO RHONITAH LUCY", "NAKAWUKI RIANAH", "NAKAYENGA MARY KATEREGGA", "NAKIBUULE SHEENAH", "NAKIJJE PRISCA RESTY", "NAKIMERA MARIA", "NAKIMULI KATRINAH PEACE", "NAMAGANDA LUISA JOY", "NAMMANDA HAIFA", "NANGENDO GABRIELLA", "NANSAMBA ESTHER", "NANSUBUGA ASIA", "NASSAAZI JACINTA KIZZA", "NATYABA EVELYN TENDO", "NAYIGA SHUDAT ZAHARA", "OSINDE AHMED", "SSAAZI RAPHEAL", "SSENDAGI SOLOMON", "SSENUNGI TITUS"],
        "VICTORS": ["AMUGE LYNDSEY MILES", "ATIM ZUBEDA", "ATULINDA AISHA", "AYEBARE MELLISA", "BATARINGAYA SHIMARO", "BUKIRWA SHAMRA DDUMBA", "BULEGA PIUS", "JJAGWE JOVAN", "JJUMBA ANGELLO", "KAJJUMBA BELLA COLYTE", "KAREMERA ABDUL HANAN", "KATONO ALLAN", "KAZIBA JOSHUA", "KIGGUNDU LIA", "KIRABO EVAS", "KIZZA JOYCE MYER SEMPA", "KYALIGONZA HARVEY RENATAH", "LUBWAMA MARTIN WASSWA", "LUKWAGO LUCKY AHMET", "LUKWAGO SHAWN", "LUYIMBAZI RODNEY", "LWANGA WYCLIFF", "MAKIKA MEEKSON", "MUBIRU RAJAB", "MUKISA PHILEMON", "MULWANA  JONATHAN", "MUSASIZI ADRIAN", "MWEBAZA PEACE", "NABWIRE GLORIA MICHELLE", "NAGAWA ANTHONIA BEATRICE", "NAKABUYE SHAROM", "NAKITTO MYRA REMEDY", "NAKITTO SHIFURAH ECMAT", "NALUBEGA JANIPHER", "NAMARA REBECCA BLESSED", "NAMAWEJJE   ELIZABETH SHANTAL", "NAMIREMBE KAHLAN MARTHA", "NAMPIJJA PATRICIA", "NAMUGENYI HELLEN", "NAMUSISI MARIA FEDERESI", "NAMWANJE MACRINAH", "NASSUNA EMILLY MATINAH", "NASSUUNA WILDER", "NAYIGA JOSELINE MARINA", "NYAKATO EDRINAH", "NYIRANEZA VIVIAN", "SSEMAKULA EZRA", "SSERUNKUMA ABRIELLE PROSPER", "TUKUNDANE EAMON", "YEBETE MARY SADAD ELIAS"]
      },
      "P7": {
        "ACHIEVERS": ["ALINDA MARIA FORTUNATE", "ASIIMWE DIVINE MERCY", "AYEBAZIBWE EDNAS", "BATARINGAYA COLLINS", "HAIRAT DAUDA", "KABAGAMBE RIVEINS BLAQ", "KARUNGI MELISSA OPRAH", "KASUMBA MARIAM ANGEL", "KATAMBALA ROMAN SOLOMON", "KIRABIRA GODFREY ALVIN", "KITAYIMBWA STANISLAUS PROSPER", "KITENGEJJA PRISCILLA", "KIYIMBA MARIAM", "KUKIRIZA JOSHUA", "KYAGABA DAVID TAYLOR", "KYAGABA JEREMIAH", "LUTEMBE RIAZ", "MASIKA SEANICE ASINGYA", "MBAZIIRA TIHAN", "MIREMBE ESTHER ANDREA AIDAH", "MUKWAYA MELVINAH MICHEELE EDITH", "MUSASIZI PHILP DAVIS", "MUTEBI IMRAN MUBIRU", "MUWANGUZI SUHAIR", "NABATEREGGA JOSELYN KIRABO", "NAGGAYI NATAVIAH", "NAJJEMBA ANNABELLE LUCY", "NAKABUYE ESTHER MARITEZ", "NAKATO MARY", "NAMATOVU JOSELINE MERCY", "NAMPIJJA JANE"],
        "SUCCESS": ["AGAWO HARMONY ASAHEL", "AINOMUGISHA JOY ATUBASIISE", "AMUGE TEMPLE", "ANKUNDA CEDRIC MURAMIRA", "ATUHAIRWE ALVIN", "ATURINDA KAREN", "BYARUHANGA HUSSEIN LEFA", "JJENGO MUSTAPHA JUMA", "KAFEERO FELIX", "KASOZI VERNICE CHRISTABELLE", "KATUSIIME SHIVAN KAIJA", "KIRISA JOEL JAYSON", "KISIRA JORAM", "LUTAAYA JOHN WILSON", "MUBIRU RAYAN KIZITO", "MUGAGGA JESSICAH NAKALEMA", "MUHUMUZA NEWMAN", "NAKABALIRA MANGDALENE NAKALEMBE", "NAKATO THERESA SEMPA", "NAKAYONDE MARIA", "NAKIBUULE AMINAH", "NAKIMULI MARIA IVY", "NAKINTU DANIELLA", "NAKYAMBADDE HENRIATAH SHEILAH", "NAKYANZI COTRIDA MARIA KIARA", "NALUBEGA SHAMIRAH KASOZI", "NAMATOVU RACHEAL", "NAMUGENYI MELISSA", "NANTABA PATRICIA", "NSANZINTWARI TREASURE MARY", "NTONGO GLORIA", "NUWAMANYA WILSON", "NUWASIIMA ANNABEL", "OKIA JORDAN DARENS", "OKOTEL BARUCH", "SSALI RAHIM", "SSERUNJOGI JOHNMARK", "TALEMWA KAGGWA VIANNEY GODROCK", "WASSWA JEREMIAH SEMPA", "WERE KELLY EDWARD", "WESONGA ALBERT MULUNGI"],
        "WINNERS": ["ABALINABYO NATASHA", "AGABA REAGAN", "AHIMBISIBWE MARKSON", "AHURIRA CALEB", "APOLOT HELLEN GRACE", "AUDO TRACY", "AYERANGO GLORIA", "BAGUMA JOSHUA JASON", "BESIGYE KEVIN", "BYARUHANGA HASSAN KGOTSO", "KAKEETO BENJAMIN BENEDICTO", "KAKOOZA SHURAIM MWESEZI", "KALYANGO JONATHAN", "KATO JOSEPH ENOCK", "KAWADWA COLLINS", "KEMIGISHA PRINCESS", "KUTOSI FAITH HANNAH", "LUKYAMUZI IVAN", "MAGUMBA SHAKUR", "MUBUYA RYAN", "MUHANGUZI LINCOLN", "MUHINDO PATRICK PEDIAH", "MUKAMA CALVIN", "MULINDWA TRAVIS KASOZI", "MULUMBA ROBINSON", "MUTEESA JOHNBAPTIST TALIIKA", "MUTIIBWA MELLISA", "NABWIRE MARIA MERCILINA", "NAKAWEESA NICOLE KELVIN", "NAKAYENGA FLAVIA", "NAKAYONGO PATRICIA BEST", "NAKIMBUGWE ELETHERIA", "NAKKU SAMANTHA HAZEL", "NAMUDDE VANESSA", "NANTEZA MARJORINE", "NANZIRA MARY IVY", "NASSUNA HARIANAH KATRINAH", "NATOORO SHARITAH KAKOOZA", "RUBANGAKENE GABRIEL", "SSEMATIMBA ERNEST", "SSEMPA RYAN TERRY", "SSENYONGA JOHNBOSCO", "SSERUNJOGI SIMON ALVIN", "WASSWA JOHN ELIJAH", "ZZIWA ANDREW GERALD"]
      }
    };

    // Count all students from all grades and classes
    let totalCount = 0;
    Object.values(studentData).forEach(grade => {
      Object.values(grade).forEach(classStudents => {
        totalCount += classStudents.length;
      });
    });

    return totalCount;
  }, []);

  const activePositions = Object.keys(positionMappings).length;
  
  const daysRemaining = Math.max(0, timeLeft.days);
  
  const [applicantCounts, setApplicantCounts] = useState<{[key: string]: number}>({});
  const [loadingApplicants, setLoadingApplicants] = useState(true);
  
  // Calculate total applicants from applicantCounts
  const totalApplicants = useMemo(() => {
    return Object.values(applicantCounts).reduce((sum, count) => sum + count, 0);
  }, [applicantCounts]);

  const electionStats = [
    { title: "Total Voters", value: totalVoters.toLocaleString(), icon: Users, color: "text-blue-500" },
    { title: "Active Positions", value: activePositions.toString(), icon: Trophy, color: "text-green-500" },
    { title: "Days Remaining", value: daysRemaining.toString(), icon: Clock, color: "text-orange-500" },
    { title: "Total Applicants", value: totalApplicants.toString(), icon: UserPlus, color: "text-purple-500", loading: loadingApplicants },
  ];

  // Fetch application counts from database
  useEffect(() => {
    const fetchApplicantCounts = async () => {
      try {
        setLoadingApplicants(true);
        const counts: {[key: string]: number} = {};
        
        // Initialize all positions with 0
        Object.keys(positionMappings).forEach(position => {
          counts[position] = 0;
        });
        
        // Count applications from database
        for (const position of Object.keys(positionMappings)) {
          const { count, error } = await supabase
            .from('electoral_applications')
            .select('*', { count: 'exact', head: true })
            .eq('position', position);
          
          if (!error && count !== null) {
            counts[position] = count;
          }
        }
        
        setApplicantCounts(counts);
      } catch (error) {
        console.error('Error fetching applicant counts:', error);
      } finally {
        setLoadingApplicants(false);
      }
    };

    fetchApplicantCounts();
    
    // Set up real-time subscription for application changes
    const channel = supabase
      .channel('electoral-applications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'electoral_applications'
        },
        () => {
          fetchApplicantCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const availablePositions = Object.entries(positionMappings).map(([key, value]) => ({
    key,
    title: value.title,
    applicants: applicantCounts[key] || 0,
    eligibleClasses: value.eligibleClasses,
  }));

  
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("You have been logged out");
      navigate("/login");
    } catch (error: any) {
      toast.error("Failed to log out");
    }
  };

  return (
    <DashboardLayout 
      userRole={userRole || "student"} 
      userName={userName} 
      photoUrl={photoUrl} 
      onLogout={handleLogout}
    >
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header with Timer */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Vote className="h-10 w-10 text-primary animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Electoral Hub
            </h1>
            <Vote className="h-10 w-10 text-primary animate-pulse" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Shape your school's future. Every voice matters, every vote counts.
          </p>
          
          {/* Countdown Timer */}
          <div className={`rounded-lg p-4 border max-w-2xl mx-auto ${
            currentPhase === 'applications' 
              ? 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800'
              : currentPhase === 'voting'
              ? 'bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800'
              : 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800'
          }`}>
            <p className={`text-sm mb-2 font-medium text-center ${
              currentPhase === 'applications' 
                ? 'text-orange-800 dark:text-orange-200'
                : currentPhase === 'voting'
                ? 'text-green-800 dark:text-green-200'
                : 'text-purple-800 dark:text-purple-200'
            }`}>
              {currentPhase === 'applications' && '🔥 Applications end in:'}
              {currentPhase === 'voting' && timeLeft.days > 0 && '📊 Voting starts in:'}
              {currentPhase === 'voting' && timeLeft.days === 0 && '🗳️ Voting ends in:'}
              {currentPhase === 'results' && '🏆 Results are now available!'}
            </p>
            {currentPhase !== 'results' && (
              <div className={`flex justify-center items-center gap-2 text-lg font-bold ${
                currentPhase === 'applications' 
                  ? 'text-orange-700 dark:text-orange-300'
                  : 'text-green-700 dark:text-green-300'
              }`}>
                <div className="flex flex-col items-center">
                  <span className="text-2xl">{timeLeft.days}</span>
                  <span className="text-xs text-muted-foreground">days</span>
                </div>
                <span className={currentPhase === 'applications' ? 'text-orange-500' : 'text-green-500'}>:</span>
                <div className="flex flex-col items-center">
                  <span className="text-2xl">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-xs text-muted-foreground">hours</span>
                </div>
                <span className={currentPhase === 'applications' ? 'text-orange-500' : 'text-green-500'}>:</span>
                <div className="flex flex-col items-center">
                  <span className="text-2xl">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-xs text-muted-foreground">min</span>
                </div>
                <span className={currentPhase === 'applications' ? 'text-orange-500' : 'text-green-500'}>:</span>
                <div className="flex flex-col items-center">
                  <span className="text-2xl">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="text-xs text-muted-foreground">sec</span>
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Main Action Cards - Above the fold */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Apply for Post */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <UserPlus className="h-7 w-7" />
                </div>
                Apply for a Post
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-base">
                Ready to lead? Submit your application and campaign for a leadership position.
              </p>
              {loadingUserClass ? (
                <div className="flex items-center justify-center py-4">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  <span className="ml-2 text-sm text-muted-foreground">Checking eligibility...</span>
                </div>
              ) : !canApplyForPosts ? (
                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                  <p className="text-sm text-orange-800 dark:text-orange-200 text-center">
                    Students in {userClass} are not eligible to apply for prefectorial positions. 
                    Only classes P2-P6 can participate in the electoral contest.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Application Deadline</span>
                      <span className="font-medium text-orange-600">Sept 19, 2025</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Open Positions</span>
                      <Badge variant="secondary">12 available</Badge>
                    </div>
                  </div>
                  <Button 
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white group-hover:scale-105 transition-transform"
                    onClick={() => navigate(hasApplication ? '/student/electoral/status' : '/student/electoral/apply')}
                    disabled={currentPhase !== 'applications'}
                  >
                    {hasApplication ? 'Track My Application' : currentPhase === 'applications' ? 'Start Application' : 'Applications Closed'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Vote */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white animate-pulse">
                  <Vote className="h-7 w-7" />
                </div>
                Cast Your Vote
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-base">
                Exercise your democratic right. Vote for the candidates you believe in.
              </p>
              {loadingUserClass ? (
                <div className="flex items-center justify-center py-4">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  <span className="ml-2 text-sm text-muted-foreground">Checking eligibility...</span>
                </div>
              ) : !canVote ? (
                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                  <p className="text-sm text-orange-800 dark:text-orange-200 text-center">
                    Students in {userClass} are not eligible to vote in the electoral process. 
                    Only classes P2-P7 can participate in voting.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Elections</span>
                      <span className="font-medium text-orange-600">Oct 16-17, 2025</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Your Status</span>
                      <Badge variant="outline" className="border-orange-200 text-orange-600">
                        Ready to Vote
                      </Badge>
                    </div>
                  </div>
                   <Button 
                     size="lg"
                     className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white animate-pulse group-hover:scale-105 transition-transform"
                     onClick={() => navigate('/student/electoral/vote')}
                     disabled={currentPhase !== 'voting' || new Date().getTime() < new Date('2025-10-16T08:00:00+03:00').getTime()}
                   >
                     {currentPhase === 'voting' && new Date().getTime() >= new Date('2025-10-16T08:00:00+03:00').getTime() ? 'Vote Now' : 
                      currentPhase === 'voting' && new Date().getTime() < new Date('2025-10-16T08:00:00+03:00').getTime() ? 'Voting starts in ' + Math.ceil((new Date('2025-10-16T08:00:00+03:00').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) + ' days' : 
                      'Voting Closed'}
                    <Vote className="ml-2 h-5 w-5" />
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {electionStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="text-center">
                <CardContent className="pt-4 pb-4">
                  <Icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-xl font-bold">
                    {stat.loading ? (
                      <div className="flex justify-center">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      </div>
                    ) : (
                      stat.value
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* View Results - Secondary Action */}
        <div className="max-w-md mx-auto">
          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 justify-center">
                <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <BarChart3 className="h-6 w-6" />
                </div>
                View Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-center">
                Track election progress and view live results
              </p>
              <div className="flex justify-center">
                <Badge variant="secondary">51% participation</Badge>
              </div>
              <Button 
                variant="outline" 
                className="w-full group-hover:bg-green-50 group-hover:border-green-300 group-hover:text-green-700 group-hover:scale-105 transition-all"
                onClick={() => navigate('/student/electoral/results')}
                disabled={currentPhase === 'applications'}
              >
                {currentPhase === 'applications' ? 'Results Not Available' : 'View Live Results'}
                <BarChart3 className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Available Candidates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Available Candidates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availablePositions.map((position, index) => (
                <div 
                  key={index} 
                  className="p-4 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/student/electoral/candidates/${position.key}`)}
                >
                  <div className="mb-2">
                    <h4 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">{position.title}</h4>
                    <Badge variant="secondary" className="text-xs mb-2">
                      {position.eligibleClasses}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {position.applicants} applicant{position.applicants !== 1 ? 's' : ''}
                    </p>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Electoral Candidates Section */}
        <CandidatesSection />

        {/* Election Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Election Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { phase: "Declaring Prefectorial Posts", date: "Sept 10, 2025", status: "completed" },
                { phase: "Online Application", date: "Sept 15, 2025", status: "active" },
                { phase: "End of Online Application", date: "Sept 19, 2025", status: "upcoming" },
                { phase: "Vetting of Nominees", date: "Sept 25-27, 2025", status: "upcoming" },
                { phase: "Display Nominated Candidates", date: "Sept 29, 2025", status: "upcoming" },
                { phase: "Open Mega Campaign", date: "Oct 1, 2025", status: "upcoming" },
                { phase: "Elections & Vote Counting", date: "Oct 16-17, 2025", status: "upcoming" },
                { phase: "Orientations & Induction", date: "Oct 25, 2025", status: "upcoming" },
                { phase: "Swearing in of Prefects", date: "Oct 26, 2025", status: "upcoming" },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/20">
                  <div className={`w-3 h-3 rounded-full ${
                    item.status === 'active' ? 'bg-orange-500 animate-pulse' : 
                    item.status === 'completed' ? 'bg-green-500' : 'bg-muted-foreground'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium">{item.phase}</p>
                    <p className="text-sm text-muted-foreground">{item.date}</p>
                  </div>
                  {item.status === 'active' && (
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                      Active
                    </Badge>
                  )}
                  {item.status === 'completed' && (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Complete
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}