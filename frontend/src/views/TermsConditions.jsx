import React from 'react';
import { useNavigate } from 'react-router-dom';
import MobileContainer from '../components/MobileContainer';
import { ArrowLeft, Shield } from 'lucide-react';

const TermsConditions = () => {
  const navigate = useNavigate();

  return (
    <MobileContainer hideNav={false}>
      <div className="flex flex-col space-y-5 pt-2 pb-6">
        {/* Header with Back Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-brand-blue-navy/50 border border-brand-gold/20 text-brand-gold active:scale-95 transition-all"
            aria-label="Go Back"
          >
            <ArrowLeft size={16} />
          </button>
          <h2 className="text-lg font-bold text-white uppercase tracking-wide flex items-center space-x-1.5">
            <Shield className="text-brand-gold h-4 w-4" />
            <span>નિયમો અને શરતો / नियम और शर्तें</span>
          </h2>
        </div>

        {/* Gujarati Rules */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl space-y-3">
          <h3 className="text-sm font-bold text-brand-gold uppercase tracking-wider border-b border-brand-gold/10 pb-1.5">
            ગુજરાતી - ઇનામની શરતો
          </h3>
          <ol className="list-decimal list-inside space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed pl-1">
            <li>
              જીતેલ ઇનામ સ્ક્રેચ કર્યા પછી <strong className="text-white">15 દિવસની અંદર</strong> મેળવવું ફરજિયાત છે. ત્યારબાદ ઇનામ અમાન્ય ગણાશે.
            </li>
            <li>
              રૂપિયા વાળા કાર્ડમાં બાકી રહેલી રકમ પરત આપવામાં આવશે નહીં.
              <div className="mt-1.5 pl-4 border-l-2 border-brand-gold/20 text-slate-400 text-[11px] sm:text-xs">
                <strong>ઉદાહરણ:</strong> જો ₹100નું કાર્ડ હોય અને ગ્રાહક ₹50ની વસ્તુ ખરીદે, તો બાકીના ₹50 પરત નહીં મળે. ગ્રાહકએ એક જ ખરીદીમાં ₹100 અથવા તેથી વધુ કિંમતની વસ્તુઓ ખરીદવી પડશે.
              </div>
            </li>
            <li>
              ₹200નું ઇનામ કાર્ડ માત્ર મોબાઇલ અથવા અન્ય ડિવાઇસના રિપેરિંગ માટે જ માન્ય રહેશે. તેનો ઉપયોગ એક્સેસરીઝ ખરીદવા માટે કરી શકાશે નહીં.
            </li>
            <li>
              અન્ય તમામ રૂપિયા વાળા કાર્ડનો ઉપયોગ રિપેરિંગ તથા મોબાઇલ એક્સેસરીઝ ખરીદવા બંને માટે કરી શકાય છે.
            </li>
            <li>
              "6D Glass" અને "Data Cable ₹30" ઇનામમાં માત્ર તે વસ્તુ જ આપવામાં આવશે. તેની બદલે રોકડ અથવા અન્ય કોઈ રકમ આપવામાં આવશે નહીં.
            </li>
            <li>
              સ્ક્રેચ કૂપનમાં જે ઇનામ દર્શાવેલું હશે, તે જ ઇનામ આપવામાં આવશે. આ ઓફર મર્યાદિત સમય અને મર્યાદિત સ્ટોક માટે જ માન્ય છે. જો સંબંધિત ઇનામનો સ્ટોક પૂર્ણ થઈ ગયો હોય અથવા ઓફરનો સમય પૂર્ણ થઈ ગયો હોય, તો તેના બદલામાં અન્ય કોઈ વસ્તુ, રોકડ રકમ અથવા વિકલ્પ આપવામાં આવશે નહીં.
            </li>

          </ol>
        </div>

        {/* Hindi Rules */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl space-y-3">
          <h3 className="text-sm font-bold text-brand-gold uppercase tracking-wider border-b border-brand-gold/10 pb-1.5">
            हिन्दी - इनाम की शर्तें
          </h3>
          <ol className="list-decimal list-inside space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed pl-1">
            <li>
              जीता हुआ इनाम स्क्रैच करने के <strong className="text-white">15 दिनों के भीतर</strong> प्राप्त करना आवश्यक है। इसके बाद इनाम मान्य नहीं रहेगा।
            </li>
            <li>
              रुपये वाले कार्ड पर बची हुई राशि वापस नहीं की जाएगी।
              <div className="mt-1.5 pl-4 border-l-2 border-brand-gold/20 text-slate-400 text-[11px] sm:text-xs">
                <strong>उदाहरण:</strong> यदि आपके पास ₹100 का कार्ड है और आप ₹50 की वस्तु खरीदते हैं, तो शेष ₹50 वापस नहीं मिलेगा। आपको ₹100 या उससे अधिक मूल्य की खरीदारी एक साथ करनी होगी।
              </div>
            </li>
            <li>
              ₹200 वाला इनाम केवल मोबाइल या अन्य डिवाइस की रिपेयरिंग के लिए ही मान्य होगा। इसे एक्सेसरीज़ खरीदने के लिए उपयोग नहीं किया जा सकता।
            </li>
            <li>
              अन्य सभी रुपये वाले कार्ड का उपयोग रिपेयरिंग तथा मोबाइल एक्सेसरीज़ खरीदने दोनों के लिए किया जा सकता है।
            </li>
            <li>
              "6D Glass" तथा "Data Cable ₹30" वाले इनाम में केवल वही वस्तु दी जाएगी। इसके स्थान पर नकद राशि या अन्य वस्तु नहीं दी जाएगी.
            </li>
            <li>
              स्क्रैच कूपन में जो इनाम दर्शाया गया होगा, केवल वही इनाम दिया जाएगा। यह ऑफर सीमित समय तथा सीमित स्टॉक के लिए ही मान्य है। यदि संबंधित इनाम का स्टॉक समाप्त हो गया हो या ऑफर की अवधि समाप्त हो गई हो, तो उसके बदले कोई अन्य वस्तु, नकद राशि या वैकल्पिक इनाम नहीं दिया जाएगा।
            </li>
          </ol>
        </div>
      </div>
    </MobileContainer>
  );
};

export default TermsConditions;
