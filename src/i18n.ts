import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export type AppLanguage = 'en' | 'mr' | 'kn';

export const languages: Array<{ code: AppLanguage; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'mr', label: 'मराठी' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
];

const resources = {
  en: {
    translation: {
      app: { name: 'Krishi-AI' },
      login: {
        title: 'Farmer Login',
        username: 'Username',
        phone: 'Phone Number',
        name: 'Full Name',
        password: 'Password / PIN',
        demoCreds: 'Demo: basavaraj / 1234 (Still active for demo)',
        loginBtn: 'Login',
        registerBtn: 'Register',
        invalid: 'Invalid phone or PIN.',
        toggleRegister: 'Don\'t have an account? Register',
        toggleLogin: 'Already have an account? Login',
      },
      common: {
        language: 'Language',
        takePhoto: 'Take Photo',
        chooseGallery: 'Choose from Gallery',
        analyze: 'Analyze',
        logout: 'Logout',
        back: 'Back',
        close: 'Close',
        analyzing: 'Analyzing...',
        selectCrop: 'Select crop',
        selectLanguage: 'Select language',
      },
      home: {
        welcome: 'Welcome, {{name}}',
        title: 'Home',
        analyzeTitle: 'Crop Disease Analyzer',
        analyzeBtn: 'Analyze Crop',
        supportedCrops: 'Supported crops',
        developer: 'Developer',
        govSchemes: 'Government Schemes',
        weather: 'Current Weather',
        agriShare: 'Agri-Share (Rentals)',
        mandiBhav: 'Mandi Bhav (Prices)',
        geoFencing: 'Measure Land (GPS)',
        community: 'Krishi Samvad (Forum)',
      },
      weather: {
        title: 'Current Weather',
        loading: 'Fetching weather for your location...',
        retry: 'Retry',
        permissionDenied: 'Location permission denied. Please enable location access.',
        loadError: 'Unable to load weather right now.',
        prediction: 'Farmer Prediction',
        max: 'Max',
        min: 'Min',
        wind: 'Wind',
        rainChance: 'Rain chance',
      },
      developer: {
        role: 'CSE Student',
        username: 'basavaraj',
        aboutTitle: 'About',
        aboutText: 'Developer of Krishi-AI — a farmer-focused app for crop disease analysis. Building tech solutions for agriculture.',
      },
      govScheme: {
        title: 'Government Schemes (India)',
        subtitle: 'Tap any scheme to open official website',
        openLink: 'Open',
        openError: 'Cannot Open',
        cannotOpen: 'Could not open link. Please try again.',
      },
      analyze: {
        title: 'Crop Disease Analyzer',
        note: 'Demo AI result (connect real model later).',
        chooseCropAndPhoto: 'Please select crop and add a photo first.',
        resultTitle: 'Analysis Result',
        plant: 'Detected Plant',
        disease: 'Disease',
        confidence: 'Confidence',
        prevention: 'Prevention',
        steps: 'Suggested Steps',
        permissionCameraDenied: 'Camera permission not granted.',
        permissionGalleryDenied: 'Gallery permission not granted.',
        photoSelected: 'Photo selected',
        shareReport: 'Share report',
        shareAsImage: 'Share as Image',
        shareAsPdf: 'Share as PDF',
        shareError: 'Share failed. Please try again.',
        apiNotConfigured: 'AI API is not configured. Using demo result.',
        apiError: 'AI analysis failed. Please try again.',
        demoFallbackUsed: 'Using demo result because AI API is not configured.',
        optimizingPhoto: 'Optimizing photo…',
        analyzeTimeout: 'Analysis took too long. Use Wi‑Fi, a closer leaf photo, or try again.',
      },
      crops: {
        rice: { label: 'Rice' },
        wheat: { label: 'Wheat' },
        tomato: { label: 'Tomato' },
        potato: { label: 'Potato' },
        cotton: { label: 'Cotton' },
      },
      agriShare: {
        title: 'Agri-Share',
        subtitle: 'Rent & Share Farming Equipment',
        addEquipment: 'List Equipment',
        viewDetails: 'Rent Now',
        perDay: '/ day',
        callOwner: 'Call Owner',
        distance: 'Distance',
        types: { vehicle: 'Vehicle', heavy: 'Heavy Machinery', tool: 'Implement/Tool' },
        items: {
          tractor: { name: 'Mahindra Tractor 575 DI', desc: '45 HP Tractor in great condition. Perfect for plowing and tilling.' },
          harvester: { name: 'Swaraj Combine Harvester', desc: 'Efficient harvester for wheat and paddy. Experienced driver included.' },
          tiller: { name: 'Honda Power Tiller', desc: 'Lightweight power tiller for small farms and inter-cultivation.' },
          sprayer: { name: 'Battery Knapsack Sprayer', desc: '16L battery-operated sprayer. Good for uniform pesticide application.' },
        },
        addScreenTitle: 'Add Equipment',
        addNameLabel: 'Equipment Name',
        addDescLabel: 'Description',
        addPriceLabel: 'Price (₹ per day)',
        addSubmit: 'Submit Listing',
      },
      mandi: {
        title: 'Mandi Bhav',
        subtitle: 'Real-Time Market Prices',
        filterCrop: 'Filter by Crop',
        filterMarket: 'Filter by Market',
        allCrops: 'All Crops',
        allMarkets: 'All Markets',
        pricePerQuintal: '₹/Quintal',
        todayModal: 'Today\'s Modal Price',
        minMax: 'Min/Max:',
        trendPrefix: 'since yesterday',
        markets: {
          sangli: 'Sangli APC',
          kolhapur: 'Kolhapur Mandi',
          pune: 'Pune APMC',
          solapur: 'Solapur Market',
          satara: 'Satara Mandi',
        },
      },
      geoFencing: {
        title: 'Land Measurement',
        waitingGps: 'waitning for gps...',
        areaAcres: 'Area (Acres)',
        areaHectares: 'Area (Hectares)',
        startBtn: 'Start Measurement',
        stopBtn: 'Stop Tracking',
        clearBtn: 'Clear',
        permissionDenied: 'Location permission is required for measuring.',
        calcError: 'Path is too complex to calculate area.',
        tooShort: 'Please walk a wider boundary (need at least 3 points).',
      },
      community: {
        title: 'Krishi Samvad',
        newPost: 'New Post',
        publish: 'Publish',
        placeholder: 'Ask your farming community a question...',
        likes: 'Likes',
        comments: 'Comments',
        commentsTitle: 'Comments',
        writeComment: 'Write a comment...',
        postComment: 'Post',
        noComments: 'No comments yet. Be the first!',
        notifications: 'Notifications',
        noNotifications: 'No new notifications right now.',
        calling: 'Calling...',
        camera: 'Camera',
        connected: 'Connected',
        you: 'You',
      },
      diseases: {
        healthy: {
          name: 'Healthy / No obvious disease detected (demo)',
          description:
            'The crop looks healthy in this demo check. Still monitor leaves and growth regularly.',
          prevention:
            'Keep proper spacing, ensure balanced nutrition, and remove any suspicious leaves early.',
          steps:
            '1) Observe regularly\n2) Maintain irrigation schedule\n3) Keep fields clean',
        },
        powdery_mildew: {
          name: 'Powdery Mildew',
          description:
            'A white powdery layer can appear on leaves and stems, often in dry/humid conditions.',
          prevention:
            'Improve airflow (proper spacing), avoid overhead watering, and remove affected leaves.',
          steps:
            '1) Remove and destroy affected leaves\n2) Spray neem oil / recommended fungicide as per local guidance\n3) Water early in the day',
        },
        leaf_spot: {
          name: 'Leaf Spot',
          description:
            'Small dark or brown spots appear on leaves. Severe cases can reduce photosynthesis.',
          prevention:
            'Use resistant varieties, avoid water splashing, and maintain field hygiene.',
          steps:
            '1) Remove infected leaves\n2) Improve drainage\n3) Use recommended fungicide if needed',
        },
        late_blight: {
          name: 'Late Blight',
          description:
            'Dark patches spread quickly, especially in cool and wet weather. Can damage leaves rapidly.',
          prevention:
            'Avoid overhead irrigation, ensure drainage, and remove infected plants early.',
          steps:
            '1) Remove infected plants\n2) Spray recommended protectant fungicide (local guidance)\n3) Avoid dense planting',
        },
        root_rot: {
          name: 'Root Rot',
          description:
            'Roots get damaged due to excess moisture. Plants may wilt and roots can appear dark/soft.',
          prevention:
            'Avoid waterlogging, improve drainage, and use healthy seed/soil.',
          steps:
            '1) Stop overwatering\n2) Improve drainage\n3) Use recommended soil treatment if available',
        },
        yellow_rust: {
          name: 'Yellow Rust',
          description:
            'Yellow-orange pustules may appear on leaves, reducing vigor and yield.',
          prevention:
            'Use resistant varieties and manage crop residues. Avoid stress and maintain nutrition.',
          steps:
            '1) Inspect field weekly\n2) Remove heavily infected plants/leaves\n3) Apply recommended fungicide at early stages',
        },
        unknown: {
          name: 'Not a crop image',
          description: 'The uploaded image does not look like a crop leaf/plant.',
          prevention:
            'Upload a clear crop leaf/plant image in good light and keep non-crop objects out of frame.',
          steps:
            '1) Capture close crop leaf/plant\n2) Use daylight\n3) Avoid blur\n4) Retry analyze',
        },
      },
    },
  },
  mr: {
    translation: {
      app: { name: 'Krishi-AI' },
      login: {
        title: 'शेतकरी लॉगिन',
        username: 'वापरकर्तानाव',
        phone: 'फोन नंबर',
        name: 'पूर्ण नाव',
        password: 'पासवर्ड / पिन',
        demoCreds: 'डेमो: basavaraj / 1234 (अजूनही सक्रिय आहे)',
        loginBtn: 'लॉगिन',
        registerBtn: 'नोंदणी करा',
        invalid: 'फोन नंबर किंवा पिन चुकीचा आहे.',
        toggleRegister: 'खाते नाही? नोंदणी करा',
        toggleLogin: 'आधीच खाते आहे? लॉगिन करा',
      },
      common: {
        language: 'भाषा',
        takePhoto: 'फोटो घ्या',
        chooseGallery: 'गॅलरीतून निवडा',
        analyze: 'विश्लेषण करा',
        logout: 'लॉगआउट',
        back: 'मागे',
        close: 'बंद',
        analyzing: 'विश्लेषण सुरू आहे...',
        selectCrop: 'पिक निवडा',
        selectLanguage: 'भाषा निवडा',
      },
      home: {
        welcome: 'स्वागत आहे, {{name}}',
        title: 'मुख्यपृष्ठ',
        analyzeTitle: 'पिक रोग विश्लेषक',
        analyzeBtn: 'पिकाचे विश्लेषण',
        supportedCrops: 'समर्थित पिके',
        developer: 'डेव्हलपर',
        govSchemes: 'सरकारी योजना',
        weather: 'सध्याचे हवामान',
        agriShare: 'अॅग्री-शेअर (भाडेतत्त्व)',
        mandiBhav: 'मंडी भाव (बाजार भाव)',
        geoFencing: 'जमीन मोजणी (GPS)',
        community: 'कृषी संवाद (कम्युनिटी)',
      },
      weather: {
        title: 'सध्याचे हवामान',
        loading: 'तुमच्या स्थानासाठी हवामान मिळवत आहे...',
        retry: 'पुन्हा प्रयत्न करा',
        permissionDenied: 'लोकेशन परवानगी नाकारली आहे. कृपया लोकेशन सुरू करा.',
        loadError: 'सध्या हवामान मिळू शकले नाही.',
        prediction: 'शेतकरी अंदाज',
        max: 'कमाल',
        min: 'किमान',
        wind: 'वारा',
        rainChance: 'पावसाची शक्यता',
      },
      govScheme: {
        title: 'सरकारी योजना (भारत)',
        subtitle: 'अधिकृत वेबसाइट उघडण्यासाठी योजनेवर टॅप करा',
        openLink: 'उघडा',
        openError: 'उघडता येत नाही',
        cannotOpen: 'लिंक उघडता आला नाही. कृपया पुन्हा प्रयत्न करा.',
      },
      developer: {
        role: 'सीएसई विद्यार्थी',
        username: 'basavaraj',
        aboutTitle: 'माहिती',
        aboutText: 'Krishi-AI अॅपचा डेव्हलपर — शेतकऱ्यांसाठी पिक रोग विश्लेषण. शेतीसाठी तंत्रज्ञान उपाय तयार करत आहे.',
      },
      analyze: {
        title: 'पिक रोग विश्लेषक',
        note: 'डेमो AI निकाल (नंतर रिअल मॉडेल जोडा).',
        chooseCropAndPhoto: 'कृपया पिक निवडा आणि फोटो जोडा.',
        resultTitle: 'विश्लेषण निकाल',
        plant: 'ओळखलेले पीक',
        disease: 'रोग',
        confidence: 'विश्वास पातळी',
        prevention: 'प्रतिबंध',
        steps: 'सूचवलेले उपाय',
        permissionCameraDenied: 'कॅमेरा परवानगी दिलेली नाही.',
        permissionGalleryDenied: 'गॅलरी परवानगी दिलेली नाही.',
        photoSelected: 'फोटो निवडलेला आहे',
        shareReport: 'रिपोर्ट शेअर करा',
        shareAsImage: 'इमेज म्हणून शेअर करा',
        shareAsPdf: 'PDF म्हणून शेअर करा',
        shareError: 'शेअर करणे अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
        apiNotConfigured: 'AI API कॉन्फिगर केलेले नाही. डेमो निकाल वापरला जात आहे.',
        apiError: 'AI विश्लेषण अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
        demoFallbackUsed: 'AI API कॉन्फिगर नाही म्हणून डेमो निकाल वापरला जातो.',
        optimizingPhoto: 'फोटो ऑप्टिमाइज करत आहे…',
        analyzeTimeout: 'विश्लेषणास खूप वेळ लागला. Wi‑Fi वापरा किंवा जवळून पानाचा फोटो घ्या.',
      },
      crops: {
        rice: { label: 'तांदूळ' },
        wheat: { label: 'गहू' },
        tomato: { label: 'टोमॅटो' },
        potato: { label: 'बटाटा' },
        cotton: { label: 'कापूस' },
      },
      agriShare: {
        title: 'अॅग्री-शेअर',
        subtitle: 'शेतीची यंत्रे भाड्याने द्या आणि घ्या',
        addEquipment: 'यंत्र नोंदवा',
        viewDetails: 'भाड्याने घ्या',
        perDay: '/ दिवस',
        callOwner: 'मालकाला कॉल करा',
        distance: 'अंतर',
        types: { vehicle: 'वाहन', heavy: 'अवजड यंत्र', tool: 'उपकरण' },
        items: {
          tractor: { name: 'महिंद्रा ट्रॅक्टर ५७५ DI', desc: '४५ HP ट्रॅक्टर उत्तम स्थितीत. नांगरणीसाठी योग्य.' },
          harvester: { name: 'स्वराज कंबाईन हार्वेस्टर', desc: 'गहू आणि धान कापणीसाठी उत्तम. अनुभवी चालकासह उपलब्ध.' },
          tiller: { name: 'होंडा पॉवर टिलर', desc: 'लहान शेतीसाठी हलक्या वजनाचा पॉवर टिलर.' },
          sprayer: { name: 'बॅटरी नॅपसॅक फवारणी यंत्र', desc: '१६ लिटर बॅटरीवर चालणारे फवारणी यंत्र.' },
        },
        addScreenTitle: 'यंत्र नोंदवा',
        addNameLabel: 'यंत्राचे नाव',
        addDescLabel: 'वर्णन',
        addPriceLabel: 'भाडे (₹ प्रति दिवस)',
        addSubmit: 'नोंदणी पूर्ण करा',
      },
      mandi: {
        title: 'मंडी भाव',
        subtitle: 'रिअल-टाइम बाजार भाव',
        filterCrop: 'पिकानुसार फिल्टर करा',
        filterMarket: 'बाजारानुसार फिल्टर करा',
        allCrops: 'सर्व पिके',
        allMarkets: 'सर्व बाजार',
        pricePerQuintal: '₹/क्विंटल',
        todayModal: 'आजचा कमाल दर',
        minMax: 'किमान/कमाल:',
        trendPrefix: 'कालपासून',
        markets: {
          sangli: 'सांगली APC',
          kolhapur: 'कोल्हापूर मंडी',
          pune: 'पुणे APMC',
          solapur: 'सोलापूर बाजार',
          satara: 'सातारा मंडी',
        },
      },
      geoFencing: {
        title: 'जमीन मोजणी',
        waitingGps: 'waitning for gps...',
        areaAcres: 'क्षेत्रफळ (एकर)',
        areaHectares: 'क्षेत्रफळ (हेक्टर)',
        startBtn: 'मोजणी सुरू करा',
        stopBtn: 'मोजणी थांबवा',
        clearBtn: 'पुसून टाका',
        permissionDenied: 'मोजणीसाठी लोकेशन परवानगी आवश्यक आहे.',
        calcError: 'क्षेत्रफळ मोजण्यास मार्ग खूप गुंतागुंतीचा आहे.',
        tooShort: 'कृपया मोठ्या प्रमाणावर चाला (मार्ग खूप लहान आहे).',
      },
      community: {
        title: 'कृषी संवाद',
        newPost: 'नवीन पोस्ट',
        publish: 'प्रकाशित करा',
        placeholder: 'आपला प्रश्न शेतकऱ्यांच्या कम्युनिटीला विचारा...',
        likes: 'लाईक्स',
        comments: 'कमेंट्स',
        commentsTitle: 'कमेंट्स',
        writeComment: 'एक कमेंट लिहा...',
        postComment: 'पोस्ट करा',
        noComments: 'अद्याप कमेंट्स नाहीत. पहिले व्हा!',
        notifications: 'सूचना (Notifications)',
        noNotifications: 'सध्या नवीन सूचना नाहीत.',
        calling: 'कॉल करत आहे...',
        camera: 'कॅमेरा',
        connected: 'कनेक्टेड आहे',
        you: 'तुम्ही',
      },
      diseases: {
        healthy: {
          name: 'आरोग्यदायी / डेमोमध्ये स्पष्ट रोग नाही',
          description:
            'या डेमो तपासणीत पीक निरोगी दिसते. तरीही पाने व वाढ नियमितपणे पाहा.',
          prevention:
            'योग्य अंतर ठेवा, संतुलित पोषण द्या आणि संशयास्पद पाने लवकर काढा.',
          steps:
            '1) नियमित निरीक्षण\n2) पाणी देण्याचे वेळापत्रक पाळा\n3) शेत स्वच्छ ठेवा',
        },
        powdery_mildew: {
          name: 'भुकटी (पावडरी) बुरशी',
          description:
            'पानांवर व देठावर पांढरी भुकटीसारखी थर दिसू शकते, विशेषतः कोरडे/ओलसर वातावरणात.',
          prevention:
            'हवेची देवाणघेवाण वाढवा (अंतर ठेवा), वरून पाणी देणे टाळा आणि बाधित पाने काढा.',
          steps:
            '1) बाधित पाने काढून नष्ट करा\n2) स्थानिक मार्गदर्शनानुसार निंबोळी तेल/योग्य फंगीसाईड फवारणी\n3) सकाळी पाणी द्या',
        },
        leaf_spot: {
          name: 'पानांवर डाग (लीफ स्पॉट)',
          description:
            'पानांवर छोटे काळे किंवा तपकिरी डाग दिसतात. तीव्र अवस्थेत पानांची कार्यक्षमता कमी होते.',
          prevention:
            'रोगप्रतिकारक वाण वापरा, पाणी पानांवर उडणे टाळा आणि शेत स्वच्छ ठेवा.',
          steps:
            '1) संसर्ग झालेली पाने काढा\n2) निचरा सुधारित करा\n3) आवश्यक असल्यास शिफारस केलेला फंगीसाईड वापरा',
        },
        late_blight: {
          name: 'लवकर/उशिरा येणारा बुरशी रोग (लेट ब्लाइट)',
          description:
            'थंड आणि दमट हवेत काळे डाग लवकर पसरतात. पाने पटकन नुकसान होऊ शकतात.',
          prevention:
            'वरून सिंचन टाळा, निचरा सुधारित ठेवा आणि संक्रमित रोपे लवकर काढा.',
          steps:
            '1) संक्रमित रोपे काढा\n2) स्थानिक मार्गदर्शनानुसार योग्य फवारणी करा\n3) दाट लागवड टाळा',
        },
        root_rot: {
          name: 'मुळकुज (रूट रॉट)',
          description:
            'जास्त ओलावा असल्याने मुळांचे नुकसान होते. झाडे करपू शकतात आणि मुळं काळी/मऊ होतात.',
          prevention:
            'पाणी साचू देऊ नका, निचरा सुधारित करा आणि निरोगी बियाणे/माती वापरा.',
          steps:
            '1) जास्त पाणी देणे थांबवा\n2) निचरा सुधारित करा\n3) उपलब्ध असल्यास योग्य माती उपचार वापरा',
        },
        yellow_rust: {
          name: 'पिवळा गंज (यलो रस्ट)',
          description:
            'पानांवर पिवळसर-केशरी खळखळ्या (पुस्ट्युल्स) दिसू शकतात, त्यामुळे वाढ व उत्पादन कमी होते.',
          prevention:
            'रोगप्रतिकारक वाण वापरा आणि पिक अवशेष व्यवस्थापन करा. ताण टाळा व पोषण द्या.',
          steps:
            '1) आठवड्याला शेत तपासा\n2) जास्त संक्रमित पाने/रोपे काढा\n3) सुरुवातीच्या टप्प्यावर शिफारस केलेला फंगीसाईड वापरा',
        },
        unknown: {
          name: 'हे पिकाचे चित्र नाही',
          description: 'अपलोड केलेले चित्र पिकाच्या पानासारखे/रोपासारखे दिसत नाही.',
          prevention:
            'चांगल्या प्रकाशात स्पष्ट पान/रोपाचे फोटो अपलोड करा. फ्रेममध्ये इतर वस्तू टाळा.',
          steps:
            '1) पान/रोप जवळून घ्या\n2) दिवसाच्या उजेडात फोटो घ्या\n3) ब्लर टाळा\n4) पुन्हा विश्लेषण करा',
        },
      },
    },
  },
  kn: {
    translation: {
      app: { name: 'Krishi-AI' },
      login: {
        title: 'ರೈತ ಲಾಗಿನ್',
        username: 'ಬಳಕೆದಾರ ಹೆಸರು',
        phone: 'ಫೋನ್ ಸಂಖ್ಯೆ',
        name: 'ಪೂರ್ಣ ಹೆಸರು',
        password: 'ಪಾಸ್ವರ್ಡ್ / ಪಿನ್',
        demoCreds: 'ಡೆಮೊ: basavaraj / 1234 (ಇನ್ನೂ ಸಕ್ರಿಯವಾಗಿದೆ)',
        loginBtn: 'ಲಾಗಿನ್',
        registerBtn: 'ನೋಂದಾಯಿಸಿ',
        invalid: 'ಫೋನ್ ಸಂಖ್ಯೆ ಅಥವಾ ಪಿನ್ ಸರಿಯಾಗಿಲ್ಲ.',
        toggleRegister: 'ಖಾತೆ ಇಲ್ಲವೇ? ನೋಂದಾಯಿಸಿ',
        toggleLogin: 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ? ಲಾಗಿನ್ ಮಾಡಿ',
      },
      common: {
        language: 'ಭಾಷೆ',
        takePhoto: 'ಫೋಟೋ ತೆಗೆಯಿರಿ',
        chooseGallery: 'ಗ್ಯಾಲರಿಯಿಂದ ಆಯ್ಕೆ',
        analyze: 'ವಿಶ್ಲೇಷಿಸಿ',
        logout: 'ಲಾಗೌಟ್',
        back: 'ಹಿಂದೆ',
        close: 'ಮುಚ್ಚಿ',
        analyzing: 'ವಿಶ್ಲೇಷಣೆ ನಡೆಯುತ್ತಿದೆ...',
        selectCrop: 'ಬೆಳೆ ಆಯ್ಕೆ',
        selectLanguage: 'ಭಾಷೆ ಆಯ್ಕೆ',
      },
      home: {
        welcome: 'ಸ್ವಾಗತ, {{name}}',
        title: 'ಮುಖಪುಟ',
        analyzeTitle: 'ಬೆಳೆ ರೋಗ ವಿಶ್ಲೇಷಕ',
        analyzeBtn: 'ಬೆಳೆ ವಿಶ್ಲೇಷಿಸಿ',
        supportedCrops: 'ಬೆಂಬಲಿತ ಬೆಳೆಗಳು',
        developer: 'ಡೆವಲಪರ್',
        govSchemes: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು',
        weather: 'ಪ್ರಸ್ತುತ ಹವಾಮಾನ',
        agriShare: 'ಅಗ್ರಿ-ಶೇರ್ (ಬಾಡಿಗೆಗೆ)',
        mandiBhav: 'ಮಂಡಿ ಭಾವ್ (ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು)',
        geoFencing: 'ಭೂಮಿ ಅಳತೆ (GPS)',
        community: 'ಕೃಷಿ ಸಂವಾದ (ಸಮುದಾಯ)',
      },
      weather: {
        title: 'ಪ್ರಸ್ತುತ ಹವಾಮಾನ',
        loading: 'ನಿಮ್ಮ ಸ್ಥಳದ ಹವಾಮಾನ ಪಡೆಯುತ್ತಿದೆ...',
        retry: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
        permissionDenied: 'ಲೊಕೇಶನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಅನುಮತಿ ನೀಡಿ.',
        loadError: 'ಈಗ ಹವಾಮಾನ ಲಭ್ಯವಿಲ್ಲ.',
        prediction: 'ರೈತ ಮುನ್ಸೂಚನೆ',
        max: 'ಗರಿಷ್ಠ',
        min: 'ಕನಿಷ್ಠ',
        wind: 'ಗಾಳಿ',
        rainChance: 'ಮಳೆಯ ಸಾಧ್ಯತೆ',
      },
      govScheme: {
        title: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು (ಭಾರತ)',
        subtitle: 'ಅಧಿಕೃತ ವೆಬ್ಸೈಟ್ ತೆರೆಯಲು ಯೋಜನೆಯ ಮೇಲೆ ಟ್ಯಾಪ್ ಮಾಡಿ',
        openLink: 'ತೆರೆ',
        openError: 'ತೆರೆಯಲು ಸಾಧ್ಯವಾಗಿಲ್ಲ',
        cannotOpen: 'ಲಿಂಕ್ ತೆರೆಯಲಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
      },
      developer: {
        role: 'ಸಿಎಸ್ಇ ವಿದ್ಯಾರ್ಥಿ',
        username: 'basavaraj',
        aboutTitle: 'ವಿವರ',
        aboutText: 'Krishi-AI ಅಪ್ಲಿಕೇಶನ್ ಡೆವಲಪರ್ — ಬೆಳೆ ರೋಗ ವಿಶ್ಲೇಷಣೆಗಾಗಿ ರೈತರು-ಕೇಂದ್ರೀಕೃತ ಅಪ್ಲಿಕೇಶನ್. ಕೃಷಿಗಾಗಿ ತಂತ್ರಜ್ಞಾನ ಪರಿಹಾರಗಳನ್ನು ನಿರ್ಮಿಸುತ್ತಿದ್ದಾರೆ.',
      },
      analyze: {
        title: 'ಬೆಳೆ ರೋಗ ವಿಶ್ಲೇಷಕ',
        note: 'ಡೆಮೊ AI ಫಲಿತಾಂಶ (ನಂತರ ನಿಜವಾದ ಮಾದರಿ ಕನೆಕ್ಟ್ ಮಾಡಿ).',
        chooseCropAndPhoto: 'ದಯವಿಟ್ಟು ಬೆಳೆ ಆಯ್ಕೆ ಮಾಡಿ ಮತ್ತು ಫೋಟೋ ಸೇರಿಸಿ.',
        resultTitle: 'ವಿಶ್ಲೇಷಣೆ ಫಲಿತಾಂಶ',
        plant: 'ಗುರುತಿಸಿದ ಬೆಳೆ',
        disease: 'ರೋಗ',
        confidence: 'ವಿಶ್ವಾಸ ಮಟ್ಟ',
        prevention: 'ತಡೆಗಟ್ಟುವಿಕೆ',
        steps: 'ಸಲಹೆಯ ಕ್ರಮಗಳು',
        permissionCameraDenied: 'ಕ್ಯಾಮೆರಾ ಅನುಮತಿ ದೊರೆತಿಲ್ಲ.',
        permissionGalleryDenied: 'ಗ್ಯಾಲರಿ ಅನುಮತಿ ದೊರೆತಿಲ್ಲ.',
        photoSelected: 'ಫೋಟೋ ಆಯ್ಕೆ ಆಗಿದೆ',
        shareReport: 'ರಿಪೋರ್ಟ್ ಹಂಚಿಕೊಳ್ಳಿ',
        shareAsImage: 'ಚಿತ್ರವಾಗಿ ಹಂಚಿಕೊಳ್ಳಿ',
        shareAsPdf: 'PDF ಆಗಿ ಹಂಚಿಕೊಳ್ಳಿ',
        shareError: 'ಹಂಚಿಕೊಳ್ಳಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
        apiNotConfigured: 'AI API ಕಾನ್ಫಿಗರ್ ಆಗಿಲ್ಲ. ಡೆಮೊ ಫಲಿತಾಂಶ ಬಳಸಲಾಗುತ್ತಿದೆ.',
        apiError: 'AI ವಿಶ್ಲೇಷಣೆ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
        demoFallbackUsed: 'AI API ಕಾನ್ಫಿಗರ್ ಇಲ್ಲದ ಕಾರಣ ಡೆಮೊ ಫಲಿತಾಂಶ ಬಳಸಲಾಗಿದೆ.',
        optimizingPhoto: 'ಫೋಟೋ ಸುಧಾರಿಸಲಾಗುತ್ತಿದೆ…',
        analyzeTimeout: 'ವಿಶ್ಲೇಷಣೆ ಬಹಳ ಸಮಯ ತೆಗೆದುಕೊಂಡಿತು. Wi‑Fi ಬಳಸಿ ಅಥವಾ ಹತ್ತಿರದ ಎಲೆಯ ಫೋಟೋ ತೆಗೆಯಿರಿ.',
      },
      crops: {
        rice: { label: 'ಅಕ್ಕಿ' },
        wheat: { label: 'ಗೋಧಿ' },
        tomato: { label: 'ಟೊಮ್ಯಾಟೋ' },
        potato: { label: 'ಆಲೂಗಡ್ಡೆ' },
        cotton: { label: 'ಹತ್ತಿ' },
      },
      mandi: {
        title: 'ಮಂಡಿ ಭಾವ್',
        subtitle: 'ನೈಜ-ಸಮಯದ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು',
        filterCrop: 'ಬೆಳೆಯ ಪ್ರಕಾರ ಫಿಲ್ಟರ್ ಮಾಡಿ',
        filterMarket: 'ಮಾರುಕಟ್ಟೆಯ ಪ್ರಕಾರ ಫಿಲ್ಟರ್ ಮಾಡಿ',
        allCrops: 'ಎಲ್ಲಾ ಬೆಳೆಗಳು',
        allMarkets: 'ಎಲ್ಲಾ ಮಾರುಕಟ್ಟೆಗಳು',
        pricePerQuintal: '₹/ಕ್ವಿಂಟಾಲ್',
        todayModal: 'ಇಂದಿನ ಸರಾಸರಿ ಬೆಲೆ',
        minMax: 'ಕನಿಷ್ಠ/ಗರಿಷ್ಠ:',
        trendPrefix: 'ನಿನ್ನೆಯಿಂದ',
        markets: {
          sangli: 'ಸಾಂಗ್ಲಿ APC',
          kolhapur: 'ಕೊಲ್ಲಾಪುರ ಮಂಡಿ',
          pune: 'ಪುಣೆ APMC',
          solapur: 'ಸೊಲ್ಲಾಪುರ ಮಾರುಕಟ್ಟೆ',
          satara: 'ಸತಾರಾ ಮಂಡಿ',
        },
      },
      geoFencing: {
        title: 'ಭೂಮಿ ಅಳತೆ',
        waitingGps: 'waitning for gps...',
        areaAcres: 'ವಿಸ್ತೀರ್ಣ (ಎಕರೆ)',
        areaHectares: 'ವಿಸ್ತೀರ್ಣ (ಹೆಕ್ಟೇರ್)',
        startBtn: 'ಅಳತೆ ಪ್ರಾರಂಭಿಸಿ',
        stopBtn: 'ಟ್ರ್ಯಾಕಿಂಗ್ ನಿಲ್ಲಿಸಿ',
        clearBtn: 'ಅರಿಸು',
        permissionDenied: 'ಅಳತೆ ಮಾಡಲು ಸ್ಥಳ ಅನುಮತಿ ಅಗತ್ಯವಿದೆ.',
        calcError: 'ವಿಸ್ತೀರ್ಣ ಲೆಕ್ಕಾಚಾರ ಮಾಡಲು ಸಾಧ್ಯವಿಲ್ಲ, ದಾರಿ ತುಂಬಾ ಸಂಕೀರ್ಣವಾಗಿದೆ.',
        tooShort: 'ದಯವಿಟ್ಟು ವಿಶಾಲ ಗಡಿಯೆಡೆಗೆ ನಡೆಯಿರಿ (ಕನಿಷ್ಠ 3 ಪಾಯಿಂಟ್‌ಗಳು ಅಗತ್ಯವಿದೆ).',
      },
      community: {
        title: 'ಕೃಷಿ ಸಂವಾದ',
        newPost: 'ಹೊಸ ಪೋಸ್ಟ್',
        publish: 'ಪ್ರಕಟಿಸಿ',
        placeholder: 'ನಿಮ್ಮ ಕೃಷಿ ಸಮುದಾಯವನ್ನು ಪ್ರಶ್ನೆ ಕೇಳಿ...',
        likes: 'ಇಷ್ಟಗಳು',
        comments: 'ಕಾಮೆಂಟ್ಗಳು',
        commentsTitle: 'ಕಾಮೆಂಟ್ಗಳು',
        writeComment: 'ಕಾಮೆಂಟ್ ಬರೆಯಿರಿ...',
        postComment: 'ಪೋಸ್ಟ್',
        noComments: 'ಯಾವುದೇ ಕಾಮೆಂಟ್‌ಗಳಿಲ್ಲ. ಮೊದಲ ಕಾಮೆಂಟ್ ಬರೆಯಿರಿ!',
        notifications: 'ಅಧಿಸೂಚನೆಗಳು',
        noNotifications: 'ಯಾವುದೇ ಹೊಸ ಅಧಿಸೂಚನೆಗಳಿಲ್ಲ.',
        calling: 'ಕರೆ ಮಾಡಲಾಗುತ್ತಿದೆ...',
        camera: 'ಕ್ಯಾಮೆರಾ',
        connected: 'ಸಂಪರ್ಕಗೊಂಡಿದೆ',
        you: 'ನೀವು',
      },
      diseases: {
        healthy: {
          name: 'ಆರೋಗ್ಯಕರ / ಡೆಮೊನಲ್ಲಿ ಸ್ಪಷ್ಟ ರೋಗ ಪತ್ತೆಯಾಗಿಲ್ಲ',
          description:
            'ಈ ಡೆಮೊ ಪರಿಶೀಲನೆಯಲ್ಲಿ ಬೆಳೆ ಆರೋಗ್ಯಕರವಾಗಿ ಕಾಣುತ್ತಿದೆ. ಎಲೆಗಳು ಮತ್ತು ಬೆಳವಣಿಗೆಯನ್ನು ನಿಯಮಿತವಾಗಿ ಗಮನಿಸಿ.',
          prevention:
            'ಸರಿಯಾದ ಅಂತರ, ಸಮತೋಲನ ಪೋಷಣೆ ಹಾಗೂ ಸಂಶಯಾಸ್ಪದ ಎಲೆಗಳನ್ನು ಬೇಗ ತೆಗೆದುಹಾಕಿ.',
          steps:
            '1) ನಿಯಮಿತವಾಗಿ ಗಮನಿಸಿ\n2) ನೀರಿನ ವೇಳಾಪಟ್ಟಿ ಪಾಲಿಸಿ\n3) ಹೊಲವನ್ನು ಸ್ವಚ್ಛವಾಗಿರಿಸಿ',
        },
        powdery_mildew: {
          name: 'ಪುಡಿ ರೋಗ (ಪೌಡರಿ ಮಿಲ್ಡ್ಯೂ)',
          description:
            'ಎಲೆಗಳು ಮತ್ತು ಕಾಂಡದ ಮೇಲೆ ಬಿಳಿ ಪುಡಿಯಂತಹ ಪದರ ಕಾಣಿಸಿಕೊಳ್ಳಬಹುದು (ಒಣ/ಆದ್ರ ವಾತಾವರಣದಲ್ಲಿ ಹೆಚ್ಚಾಗುತ್ತದೆ).',
          prevention:
            ' ಗಾಳಿಯ ಹರಿವು ಹೆಚ್ಚಿಸಿ (ಅಂತರ ಬಿಡಿ), ಮೇಲಿನಿಂದ ನೀರು ಹಾಕುವುದು ತಪ್ಪಿಸಿ, ಸೋಂಕಾದ ಎಲೆಗಳನ್ನು ತೆಗೆದುಹಾಕಿ.',
          steps:
            '1) ಸೋಂಕಾದ ಎಲೆಗಳನ್ನು ತೆಗೆದು ನಾಶಮಾಡಿ\n2) ಸ್ಥಳೀಯ ಸಲಹೆಯಂತೆ ನೀಮ್ ಆಯಿಲ್/ಶಿಫಾರಸಾದ ಫಂಗಿಸೈಡ್ ಸಿಂಪಡಿಸಿ\n3) ಬೆಳಿಗ್ಗೆ ನೀರು ನೀಡಿ',
        },
        leaf_spot: {
          name: 'ಎಲೆ ಕಲೆ (ಲೀಫ್ ಸ್ಪಾಟ್)',
          description:
            'ಎಲೆಗಳ ಮೇಲೆ ಸಣ್ಣ ಕಪ್ಪು ಅಥವಾ ಕಂದು ಕಲೆಗಳು ಕಾಣುತ್ತವೆ. ಗಂಭೀರವಾಗಿದ್ದರೆ ಫೋಟೋಸಿಂಥಸಿಸ್ ಕಡಿಮೆಯಾಗುತ್ತದೆ.',
          prevention:
            'ರೋಗ ನಿರೋಧಕ ತಳಿಗಳನ್ನು ಬಳಸಿ, ನೀರು ಎಲೆಗಳ ಮೇಲೆ ಬೀಳದಂತೆ ನೋಡಿಕೊಳ್ಳಿ ಮತ್ತು ಹೊಲ ಸ್ವಚ್ಛವಾಗಿಡಿ.',
          steps:
            '1) ಸೋಂಕಿತ ಎಲೆಗಳನ್ನು ತೆಗೆದುಹಾಕಿ\n2) ನೀರು ನಿಲ್ಲದಂತೆ ಡ್ರೆನೇಜ್ ಸುಧಾರಿಸಿ\n3) ಬೇಕಾದರೆ ಶಿಫಾರಸಾದ ಫಂಗಿಸೈಡ್ ಬಳಸಿ',
        },
        late_blight: {
          name: 'ಲೇಟ್ಬ್ಲೈಟ್',
          description:
            'ತಂಪು ಮತ್ತು ಮಳೆಗಾಲದ ವಾತಾವರಣದಲ್ಲಿ ಗಾಢ ಕಲೆಗಳು ವೇಗವಾಗಿ ಹರಡುತ್ತವೆ. ಎಲೆಗಳಿಗೆ ತೀವ್ರ ಹಾನಿ ಮಾಡಬಹುದು.',
          prevention:
            'ಮೇಲಿನಿಂದ ನೀರು ಹಾಕುವುದು ತಪ್ಪಿಸಿ, ಡ್ರೆನೇಜ್ ಸುಧಾರಿಸಿ ಮತ್ತು ಸೋಂಕಿತ ಗಿಡಗಳನ್ನು ಬೇಗ ತೆಗೆದುಹಾಕಿ.',
          steps:
            '1) ಸೋಂಕಿತ ಗಿಡಗಳನ್ನು ತೆಗೆದುಹಾಕಿ\n2) ಸ್ಥಳೀಯ ಮಾರ್ಗದರ್ಶನದಂತೆ ರಕ್ಷಕ ಫಂಗಿಸೈಡ್ ಸಿಂಪಡಿಸಿ\n3) ತುಂಬಾ ದಟ್ಟವಾಗಿ ನೆಡುವುದನ್ನು ತಪ್ಪಿಸಿ',
        },
        root_rot: {
          name: 'ಮೂಲ ಕುಳು (ರೂಟ್ ರಾಟ್)',
          description:
            'ಅತಿಯಾದ ತೇವದಿಂದ ಬೇರುಗಳು ಹಾನಿಯಾಗುತ್ತವೆ. ಗಿಡಗಳು ವಾಡಬಹುದು ಮತ್ತು ಬೇರುಗಳು ಕಪ್ಪು/ಮೃದುವಾಗಬಹುದು.',
          prevention:
            'ನೀರು ನಿಲ್ಲಲು ಬಿಡಬೇಡಿ, ಡ್ರೆನೇಜ್ ಸುಧಾರಿಸಿ ಮತ್ತು ಆರೋಗ್ಯಕರ ಬೀಜ/ಮಣ್ಣು ಬಳಸಿ.',
          steps:
            '1) ಅತಿಯಾಗಿ ನೀರು ಕೊಡದಿರಿ\n2) ಡ್ರೆನೇಜ್ ಸುಧಾರಿಸಿ\n3) ಲಭ್ಯವಿದ್ದರೆ ಶಿಫಾರಸಾದ ಮಣ್ಣು ಚಿಕಿತ್ಸೆ ಬಳಸಿ',
        },
        yellow_rust: {
          name: 'ಹಳದಿ ರಸ್ಟ್',
          description:
            'ಎಲೆಗಳ ಮೇಲೆ ಹಳದಿ-ಕಿತ್ತಳೆ ಬಣ್ಣದ ಪುಟ್ಟೆಗಳು ಕಾಣಬಹುದು. ಇದು ಬೆಳವಣಿಗೆ ಮತ್ತು ಇಳುವರಿಯನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ.',
          prevention:
            'ರೋಗ ನಿರೋಧಕ ತಳಿಗಳನ್ನು ಬಳಸಿ ಮತ್ತು ಬೆಳೆ ಅವಶೇಷಗಳನ್ನು ನಿರ್ವಹಿಸಿ. ಒತ್ತಡ ಕಡಿಮೆ ಮಾಡಿ ಹಾಗೂ ಪೋಷಣೆ ಸರಿಯಾಗಿ ನೀಡಿ.',
          steps:
            '1) ವಾರಕ್ಕೆ ಒಮ್ಮೆ ಹೊಲ ಪರಿಶೀಲಿಸಿ\n2) ತುಂಬಾ ಸೋಂಕಿತ ಎಲೆ/ಗಿಡಗಳನ್ನು ತೆಗೆದುಹಾಕಿ\n3) ಆರಂಭದ ಹಂತದಲ್ಲೇ ಶಿಫಾರಸಾದ ಫಂಗಿಸೈಡ್ ಬಳಸಿ',
        },
        unknown: {
          name: 'ಇದು ಬೆಳೆ ಚಿತ್ರವಲ್ಲ',
          description: 'ಅಪ್ಲೋಡ್ ಮಾಡಿದ ಚಿತ್ರವು ಬೆಳೆ ಎಲೆ/ಗಿಡದಂತೆ ಕಾಣುವುದಿಲ್ಲ.',
          prevention:
            'ಚೆನ್ನಾದ ಬೆಳಕಿನಲ್ಲಿ ಸ್ಪಷ್ಟ ಬೆಳೆ ಎಲೆ/ಗಿಡದ ಫೋಟೋ ಅಪ್ಲೋಡ್ ಮಾಡಿ. ಫ್ರೇಮ್‌ನಲ್ಲಿ ಬೇರೆ ವಸ್ತುಗಳನ್ನು ತಪ್ಪಿಸಿ.',
          steps:
            '1) ಎಲೆ/ಗಿಡವನ್ನು ಹತ್ತಿರದಿಂದ ಸೆರೆಹಿಡಿ\n2) ಹಗಲು ಬೆಳಕಿನಲ್ಲಿ ಫೋಟೋ ತೆಗೆಡಿ\n3) ಬ್ಲರ್ ತಪ್ಪಿಸಿ\n4) ಮರು ವಿಶ್ಲೇಷಿಸಿ',
        },
      },
    },
  },
};

export function initI18n() {
  if (i18n.isInitialized) return;

  i18n.use(initReactI18next).init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v4',
  });
}

export default i18n;

