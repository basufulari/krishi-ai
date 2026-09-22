export type GovScheme = {
  id: string;
  nameEn: string;
  nameMr: string;
  nameKn: string;
  descEn: string;
  descMr: string;
  descKn: string;
  url: string;
};

export const govSchemes: GovScheme[] = [
  {
    id: 'pmkisan',
    nameEn: 'PM-KISAN',
    nameMr: 'प्रधानमंत्री किसान सम्मान निधि',
    nameKn: 'ಪಿಎಂ-ಕಿಸಾನ್',
    descEn: '₹6,000/year direct transfer to small & marginal farmers. Check status at pmkisan.gov.in',
    descMr: 'छोट्या व सीमांत शेतकऱ्यांना दरवर्षी ₹6,000 थेट हस्तांतरण. pmkisan.gov.in वर तपासा',
    descKn: 'ಸಣ್ಣ ಹಾಗೂ ಅಂಚಿನ ರೈತರಿಗೆ ವರ್ಷಕ್ಕೆ ₹6,000 ನೇರ ಹಸ್ತಾಂತರ. pmkisan.gov.in ನಲ್ಲಿ ಪರಿಶೀಲಿಸಿ',
    url: 'https://pmkisan.gov.in',
  },
  {
    id: 'pmfby',
    nameEn: 'PMFBY - Crop Insurance',
    nameMr: 'प्रधानमंत्री फसल बीमा योजना',
    nameKn: 'ಪಿಎಂಎಫ್ಬಿವೈ - ಬೆಳೆ ವಿಮಾ',
    descEn: 'Affordable crop insurance for natural risks. Register at pmfby.gov.in',
    descMr: 'नैसर्गिक जोखिमांसाठी किफायतशीर पिक बीमा. pmfby.gov.in वर नोंदणी करा',
    descKn: 'ನೈಸರ್ಗಿಕ ಅಪಾಯಗಳಿಗಾಗಿ ಸುಲಭ ಬೆಳೆ ವಿಮಾ. pmfby.gov.in ನಲ್ಲಿ ನೋಂದಣಿ',
    url: 'https://pmfby.gov.in',
  },
  {
    id: 'enam',
    nameEn: 'e-NAM - National Agriculture Market',
    nameMr: 'ई-नाम - राष्ट्रीय कृषी बाजार',
    nameKn: 'ಇ-ನಾಮ್ - ರಾಷ್ಟ್ರೀಯ ಕೃಷಿ ಮಾರುಕಟ್ಟೆ',
    descEn: 'Online trading platform. Sell crops across APMCs. enam.gov.in',
    descMr: 'ऑनलाइन व्यापार प्लॅटफॉर्म. APMC मध्ये पिक विक्री करा. enam.gov.in',
    descKn: 'ಆನ್ಲೈನ್ ವ್ಯಾಪಾರ ವೇದಿಕೆ. APMC ಮಾರುಕಟ್ಟೆಗಳಲ್ಲಿ ಬೆಳೆ ಮಾರಾಟ. enam.gov.in',
    url: 'https://enam.gov.in',
  },
  {
    id: 'soilhealth',
    nameEn: 'Soil Health Card',
    nameMr: 'माती आरोग्य कार्ड',
    nameKn: 'ಮಣ್ಣು ಆರೋಗ್ಯ ಕಾರ್ಡ್',
    descEn: 'Free soil testing & nutrient recommendations. soilhealth.dac.gov.in',
    descMr: 'विनामूल्य माती तपासणी आणि पोषण शिफारसी. soilhealth.dac.gov.in',
    descKn: 'ಉಚಿತ ಮಣ್ಣು ಪರೀಕ್ಷೆ ಮತ್ತು ಪೋಷಕ ಶಿಫಾರಸುಗಳು. soilhealth.dac.gov.in',
    url: 'https://soilhealth.dac.gov.in',
  },
  {
    id: 'kcc',
    nameEn: 'Kisan Credit Card (KCC)',
    nameMr: 'किसान क्रेडिट कार्ड',
    nameKn: 'ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್',
    descEn: 'Subsidised credit for crops, inputs. Apply at your bank or agricoop.gov.in',
    descMr: 'पिक, खते इ. साठी सबसिडी असलेले क्रेडिट. बँकेत किंवा agricoop.gov.in वर अर्ज करा',
    descKn: 'ಬೆಳೆ, ಇನ್ಪುಟ್ಗಳಿಗೆ ರಿಯಾಯಿತಿ ಸಾಲ. ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಅಥವಾ agricoop.gov.in ನಲ್ಲಿ ಅರ್ಜಿ',
    url: 'https://agricoop.gov.in',
  },
  {
    id: 'pmksy',
    nameEn: 'PMKSY - Irrigation Scheme',
    nameMr: 'प्रधानमंत्री कृषी सिंचन योजना',
    nameKn: 'ಪಿಎಂಕೆಎಸ್ ವೈ - ನೀರಾವರಿ ಯೋಜನೆ',
    descEn: 'Micro irrigation & water conservation. More info at agricoop.gov.in',
    descMr: 'सूक्ष्म सिंचन आणि पाणी संरक्षण. agricoop.gov.in वर अधिक माहिती',
    descKn: 'ಸೂಕ್ಷ್ಮ ನೀರಾವರಿ ಹಾಗೂ ನೀರು ಸಂರಕ್ಷಣೆ. agricoop.gov.in ನಲ್ಲಿ ಹೆಚ್ಚಿನ ಮಾಹಿತಿ',
    url: 'https://agricoop.gov.in',
  },
  {
    id: 'pkvy',
    nameEn: 'PKVY - Organic Farming',
    nameMr: 'परंपरागत कृषी विकास योजना',
    nameKn: 'ಪಿಕೆವೈ ವೈ - ಸಾವಯವ ಕೃಷಿ',
    descEn: 'Support for organic farming & certification. agricoop.gov.in',
    descMr: 'सेंद्रिय शेती आणि प्रमाणन साठी मदत. agricoop.gov.in',
    descKn: 'ಸಾವಯವ ಕೃಷಿ ಹಾಗೂ ಪ್ರಮಾಣೀಕರಣಕ್ಕೆ ಬೆಂಬಲ. agricoop.gov.in',
    url: 'https://agricoop.gov.in',
  },
  {
    id: 'india_gov',
    nameEn: 'India.gov.in - All Schemes',
    nameMr: 'India.gov.in - सर्व योजना',
    nameKn: 'India.gov.in - ಎಲ್ಲಾ ಯೋಜನೆಗಳು',
    descEn: 'Central portal for all government schemes & services',
    descMr: 'सर्व सरकारी योजना आणि सेवांसाठी केंद्रीय पोर्टल',
    descKn: 'ಎಲ್ಲಾ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ಹಾಗೂ ಸೇವೆಗಳಿಗಾಗಿ ಕೇಂದ್ರೀಯ ಪೋರ್ಟಲ್',
    url: 'https://www.india.gov.in',
  },
];
