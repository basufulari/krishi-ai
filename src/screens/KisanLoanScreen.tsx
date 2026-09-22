import React, { useState, useMemo, useEffect } from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { logActivity } from '../utils/logActivity';

type Props = {
  onBackHome: () => void;
};

type Scheme = {
  id: string;
  name: string;
  nameHindi: string;
  category: 'crop' | 'infra' | 'income' | 'allied' | 'food';
  categoryLabel: string;
  emoji: string;
  body: string;
  interestRate: string;
  maxAmount: string;
  validity: string;
  collateral: string;
  eligibility: string[];
  keyBenefits: string[];
  howToApply: string;
  officialUrl: string;
  urlLabel: string;
  color: string;
  bg: string;
  border: string;
  tag: string;
};

// ─── 100% OFFICIAL DATA — sourced from pib.gov.in, nabard.org, pmkisan.gov.in ───
const SCHEMES: Scheme[] = [
  {
    id: 'kcc',
    name: 'Kisan Credit Card (KCC)',
    nameHindi: 'किसान क्रेडिट कार्ड',
    category: 'crop',
    categoryLabel: 'Crop Loan',
    emoji: '💳',
    body: 'Govt. of India — All Nationalised Banks, RRBs & Cooperative Banks',
    interestRate: '7% p.a. (4% with prompt repayment incentive)',
    maxAmount: '₹3 Lakh (short-term) | Higher for allied activities',
    validity: 'Card valid for 5 years, annual review',
    collateral: 'No collateral up to ₹2 Lakh',
    eligibility: [
      'Owner cultivator farmers (individual or joint)',
      'Tenant farmers, oral lessees & sharecroppers',
      'SHGs or Joint Liability Groups (JLGs) of farmers',
      'Those in dairy, fisheries & animal husbandry',
      'Age: 18 to 75 years',
    ],
    keyBenefits: [
      'Revolving cash credit — withdraw & repay as needed',
      'RuPay card for ATM / Micro-ATM access',
      '3% additional interest subvention on prompt repayment',
      'Covers crop cultivation, post-harvest & marketing costs',
      'Personal accident insurance up to ₹50,000 included',
    ],
    howToApply: 'Visit your nearest bank branch (SBI, BOB, PNB, Union Bank, Canara, RRB, or Cooperative Bank). Carry Aadhaar, PAN, land records (7/12 or Khasra), and passport photos.',
    officialUrl: 'https://www.myscheme.gov.in/schemes/kcc',
    urlLabel: 'myscheme.gov.in',
    color: '#166534',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    tag: 'Most Popular',
  },
  {
    id: 'pmkisan',
    name: 'PM-KISAN Samman Nidhi',
    nameHindi: 'पीएम किसान सम्मान निधि',
    category: 'income',
    categoryLabel: 'Income Support',
    emoji: '🌾',
    body: 'Ministry of Agriculture & Farmers Welfare, Govt. of India',
    interestRate: 'Not a loan — Direct benefit transfer (DBT)',
    maxAmount: '₹6,000 per year (₹2,000 every 4 months)',
    validity: 'Ongoing (registered farmers receive each instalment automatically)',
    collateral: 'Not applicable',
    eligibility: [
      'All landholding farmer families with cultivable land',
      'Land must be in the farmer\'s name (or family\'s name)',
      'Applicable to small and marginal farmers primarily',
      'Must have valid Aadhaar-linked bank account',
    ],
    keyBenefits: [
      '₹2,000 directly into bank account every 4 months',
      'No repayment required — it is income support, not a loan',
      'Use funds for seeds, fertilizers, or personal needs',
      'Register online via pmkisan.gov.in — no agent needed',
    ],
    howToApply: 'Register at pmkisan.gov.in or visit your nearest CSC (Common Service Centre). Required: Aadhaar card, land records, bank passbook. Self-registration is free.',
    officialUrl: 'https://pmkisan.gov.in',
    urlLabel: 'pmkisan.gov.in',
    color: '#92400e',
    bg: '#fffbeb',
    border: '#fde68a',
    tag: 'No Repayment',
  },
  {
    id: 'aif',
    name: 'Agriculture Infrastructure Fund (AIF)',
    nameHindi: 'कृषि अवसंरचना कोष',
    category: 'infra',
    categoryLabel: 'Infrastructure',
    emoji: '🏗️',
    body: 'Ministry of Agriculture & Farmers Welfare — via scheduled banks & NABARD',
    interestRate: '3% interest subvention p.a. (for up to 7 years)',
    maxAmount: 'Up to ₹2 Crore per project (interest subvention on first ₹2 Cr)',
    validity: 'Medium to long-term loan (up to 7 years repayment)',
    collateral: 'Credit guarantee coverage up to ₹2 Crore via CGTMSE',
    eligibility: [
      'Individual farmers and FPOs (Farmer Producer Organisations)',
      'PACS (Primary Agricultural Cooperative Societies)',
      'Marketing Cooperative Societies & SHGs',
      'Agri-entrepreneurs, Start-ups, and agri-tech companies',
      'Central/State agency joint ventures for farm infra',
    ],
    keyBenefits: [
      '3% interest subvention — reduces cost of borrowing significantly',
      'For: cold storage, warehouses, sorting-grading units, silos',
      'Credit guarantee — no personal collateral needed up to ₹2 Cr',
      'Available to FPOs and cooperatives — not just individuals',
    ],
    howToApply: 'Apply online at agriinfra.dac.gov.in or visit your bank. Submit project DPR (Detailed Project Report), land documents, and identity proof.',
    officialUrl: 'https://agriinfra.dac.gov.in',
    urlLabel: 'agriinfra.dac.gov.in',
    color: '#1e40af',
    bg: '#eff6ff',
    border: '#bfdbfe',
    tag: 'For Infrastructure',
  },
  {
    id: 'pmfme',
    name: 'PM Formalisation of Micro Food Processing (PMFME)',
    nameHindi: 'पीएम सूक्ष्म खाद्य उद्यम',
    category: 'food',
    categoryLabel: 'Food Processing',
    emoji: '🏭',
    body: 'Ministry of Food Processing Industries, Govt. of India',
    interestRate: '35% Capital Subsidy (not an interest-based loan)',
    maxAmount: 'Subsidy ceiling: ₹10 Lakh per unit',
    validity: 'Apply once; subsidy disbursed after bank loan sanction',
    collateral: 'Depends on bank — subsidy portion reduces loan burden',
    eligibility: [
      'Existing micro food processing units (any food product)',
      'New units set up by individual entrepreneurs',
      'One person per family (self, spouse, or children) eligible',
      'Applicant must contribute minimum 10% of project cost',
      'FPOs, SHGs, Cooperatives also eligible for cluster support',
    ],
    keyBenefits: [
      '35% subsidy on eligible project cost (max ₹10 Lakh)',
      'Supports: pickle, jam, spice, flour, dairy, snacks units',
      'Formalization support — FSSAI license, GST, Udyam Aadhaar',
      'Linked to One District One Product (ODOP) clusters',
    ],
    howToApply: 'Apply at pmfme.mofpi.gov.in. Submit: Aadhaar, business plan, land/lease documents, bank account details. No agent required.',
    officialUrl: 'https://pmfme.mofpi.gov.in',
    urlLabel: 'pmfme.mofpi.gov.in',
    color: '#9a3412',
    bg: '#fff7ed',
    border: '#fed7aa',
    tag: '35% Subsidy',
  },
  {
    id: 'mudra',
    name: 'PM Mudra Yojana (Agri-Allied)',
    nameHindi: 'प्रधानमंत्री मुद्रा योजना',
    category: 'allied',
    categoryLabel: 'Allied Activities',
    emoji: '🐄',
    body: 'MUDRA Ltd. (under RBI) — via all scheduled commercial banks & MFIs',
    interestRate: 'Varies by bank (approx. 8%–12% p.a.) — No fixed govt. rate',
    maxAmount: 'Shishu: ₹50K | Kishore: ₹5L | Tarun: ₹10L | Tarun Plus: ₹20L',
    validity: 'Loan tenure varies: 3–5 years typically',
    collateral: 'No collateral required up to ₹10 Lakh',
    eligibility: [
      'Individuals, firms, or companies in allied agri activities',
      'Poultry farming, dairy, beekeeping, pisciculture, sericulture',
      'Food & agri-processing (non-crop cultivation activities)',
      'Must NOT be a defaulter with any bank/financial institution',
    ],
    keyBenefits: [
      'No collateral for loans up to ₹10 Lakh',
      'Covers: dairy cows, poultry sheds, fish ponds, bee boxes',
      'Tarun Plus up to ₹20 Lakh for repeat good borrowers',
      'Apply at any bank or NBFC — Mudra portal links all',
    ],
    howToApply: 'Apply at mudra.org.in or directly at any bank/NBFC/MFI. Carry: Aadhaar, PAN, business plan/proof, 2 passport photos, and bank statement.',
    officialUrl: 'https://www.mudra.org.in',
    urlLabel: 'mudra.org.in',
    color: '#5b21b6',
    bg: '#faf5ff',
    border: '#ddd6fe',
    tag: 'No Collateral',
  },
  {
    id: 'ahidf',
    name: 'Animal Husbandry Infrastructure Development Fund (AHIDF)',
    nameHindi: 'पशुपालन अवसंरचना विकास कोष',
    category: 'allied',
    categoryLabel: 'Allied Activities',
    emoji: '🐓',
    body: 'Dept. of Animal Husbandry & Dairying, Govt. of India — via Scheduled Banks',
    interestRate: '3% interest subvention p.a. (for up to 8 years)',
    maxAmount: '₹2 Crore – ₹50 Crore (project-dependent)',
    validity: 'Up to 8 years repayment; 2-year moratorium on principal',
    collateral: 'Credit guarantee under AHIDF Credit Guarantee Fund',
    eligibility: [
      'Private companies, MSMEs and individual entrepreneurs',
      'Farmer Producer Organisations (FPOs)',
      'Section 8 companies and Cooperatives',
      'For: dairy processing, meat processing, animal feed plants',
      'Minimum 10% promoter contribution required',
    ],
    keyBenefits: [
      '3% interest subvention — major cost reduction on large loans',
      '2-year moratorium period on principal repayment',
      'Supports modern dairy, poultry & meat processing facilities',
      'Credit guarantee reduces need for physical collateral',
    ],
    howToApply: 'Apply at ahidf.udyamimitra.in. Submit: DPR, promoter details, financial projections, land/lease proof, and bank documents.',
    officialUrl: 'https://ahidf.udyamimitra.in',
    urlLabel: 'ahidf.udyamimitra.in',
    color: '#065f46',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    tag: 'Dairy & Poultry',
  },
];

const CATEGORIES = [
  { id: 'all',    label: 'All Schemes', emoji: '📋' },
  { id: 'crop',   label: 'Crop Loan',   emoji: '🌾' },
  { id: 'income', label: 'Income',      emoji: '💰' },
  { id: 'infra',  label: 'Infra',       emoji: '🏗️' },
  { id: 'allied', label: 'Allied',      emoji: '🐄' },
  { id: 'food',   label: 'Food',        emoji: '🏭' },
];

export function KisanLoanScreen({ onBackHome }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchText, setSearchText] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Track screen visit
  useEffect(() => {
    void logActivity('LOAN', 'Browsed Kisan Loan government schemes');
  }, []);

  const filtered = useMemo(() => {
    return SCHEMES.filter((s) => {
      const matchCat = activeCategory === 'all' || s.category === activeCategory;
      const q = searchText.toLowerCase();
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.nameHindi.toLowerCase().includes(q) ||
        s.body.toLowerCase().includes(q) ||
        s.categoryLabel.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchText]);

  function openUrl(url: string) {
    Linking.openURL(url).catch(() => {});
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBackHome} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>🏦 Kisan Loan Finder</Text>
          <Text style={styles.headerSub}>Official Government Schemes Only</Text>
        </View>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimerBanner}>
        <Text style={styles.disclaimerIcon}>✅</Text>
        <Text style={styles.disclaimerText}>
          All schemes listed are official Government of India programs. Data sourced from pib.gov.in, nabard.org & myscheme.gov.in.
        </Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Search Bar */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search scheme name, type..."
            placeholderTextColor="#94a3b8"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Text style={styles.searchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: 14, gap: 8 }}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveCategory(cat.id)}
                activeOpacity={0.75}
              >
                <Text style={styles.filterEmoji}>{cat.emoji}</Text>
                <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Count */}
        <Text style={styles.resultCount}>{filtered.length} scheme{filtered.length !== 1 ? 's' : ''} found</Text>

        {/* Scheme Cards */}
        {filtered.map((scheme) => {
          const isExpanded = expandedId === scheme.id;
          return (
            <View key={scheme.id} style={[styles.card, { borderColor: scheme.border, backgroundColor: scheme.bg }]}>
              {/* Card Header */}
              <TouchableOpacity
                style={styles.cardHeader}
                onPress={() => setExpandedId(isExpanded ? null : scheme.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.cardIconWrap, { backgroundColor: scheme.border }]}>
                  <Text style={styles.cardEmoji}>{scheme.emoji}</Text>
                </View>
                <View style={styles.cardTitles}>
                  <View style={styles.cardNameRow}>
                    <Text style={[styles.cardName, { color: scheme.color }]}>{scheme.name}</Text>
                    <View style={[styles.tagBadge, { backgroundColor: scheme.color }]}>
                      <Text style={styles.tagText}>{scheme.tag}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardNameHindi}>{scheme.nameHindi}</Text>
                  <Text style={styles.cardCategory}>{scheme.categoryLabel}</Text>
                </View>
                <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {/* Quick Stats */}
              <View style={styles.quickStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Interest</Text>
                  <Text style={[styles.statValue, { color: scheme.color }]}>{scheme.interestRate.split('(')[0].trim()}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Max Amount</Text>
                  <Text style={[styles.statValue, { color: scheme.color }]}>{scheme.maxAmount.split('|')[0].trim()}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Collateral</Text>
                  <Text style={[styles.statValue, { color: scheme.color }]} numberOfLines={1}>{scheme.collateral.split(' ')[0] === 'No' ? 'Not Required' : 'Required'}</Text>
                </View>
              </View>

              {/* Expanded Details */}
              {isExpanded && (
                <View style={styles.expandedSection}>
                  {/* Offered By */}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>🏛️</Text>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailTitle}>Offered By</Text>
                      <Text style={styles.detailText}>{scheme.body}</Text>
                    </View>
                  </View>

                  {/* Eligibility */}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>✅</Text>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailTitle}>Who Can Apply</Text>
                      {scheme.eligibility.map((e, i) => (
                        <View key={i} style={styles.bulletRow}>
                          <Text style={styles.bullet}>•</Text>
                          <Text style={styles.bulletText}>{e}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Key Benefits */}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>⭐</Text>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailTitle}>Key Benefits</Text>
                      {scheme.keyBenefits.map((b, i) => (
                        <View key={i} style={styles.bulletRow}>
                          <Text style={[styles.bullet, { color: scheme.color }]}>→</Text>
                          <Text style={styles.bulletText}>{b}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Amount & Terms */}
                  <View style={styles.termsGrid}>
                    <View style={[styles.termBox, { borderColor: scheme.border }]}>
                      <Text style={styles.termLabel}>💰 Max Amount</Text>
                      <Text style={[styles.termValue, { color: scheme.color }]}>{scheme.maxAmount}</Text>
                    </View>
                    <View style={[styles.termBox, { borderColor: scheme.border }]}>
                      <Text style={styles.termLabel}>📅 Validity</Text>
                      <Text style={[styles.termValue, { color: scheme.color }]}>{scheme.validity}</Text>
                    </View>
                    <View style={[styles.termBox, { borderColor: scheme.border }]}>
                      <Text style={styles.termLabel}>🔒 Collateral</Text>
                      <Text style={[styles.termValue, { color: scheme.color }]}>{scheme.collateral}</Text>
                    </View>
                    <View style={[styles.termBox, { borderColor: scheme.border }]}>
                      <Text style={styles.termLabel}>📊 Interest Rate</Text>
                      <Text style={[styles.termValue, { color: scheme.color }]}>{scheme.interestRate}</Text>
                    </View>
                  </View>

                  {/* How to Apply */}
                  <View style={styles.applyBox}>
                    <Text style={styles.applyTitle}>📝 How to Apply</Text>
                    <Text style={styles.applyText}>{scheme.howToApply}</Text>
                  </View>

                  {/* Official Link */}
                  <TouchableOpacity
                    style={[styles.officialBtn, { backgroundColor: scheme.color }]}
                    onPress={() => openUrl(scheme.officialUrl)}
                    activeOpacity={0.82}
                  >
                    <Text style={styles.officialBtnText}>🌐  Visit Official Portal</Text>
                    <Text style={styles.officialBtnUrl}>{scheme.urlLabel}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        {/* Footer Note */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>⚠️ Important Notice</Text>
          <Text style={styles.footerText}>
            Scheme details are for informational purposes only. Interest rates and eligibility may change. Always verify with the official portal or your nearest bank branch before applying.{'\n\n'}
            NABARD does NOT lend directly to individual farmers. Always approach your bank or cooperative society for loan applications.
          </Text>
          <TouchableOpacity style={styles.nabardBtn} onPress={() => openUrl('https://www.nabard.org')} activeOpacity={0.8}>
            <Text style={styles.nabardBtnText}>🔗  Visit NABARD Official Site</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.myschemeBtn} onPress={() => openUrl('https://www.myscheme.gov.in')} activeOpacity={0.8}>
            <Text style={styles.myschemeBtnText}>🔗  All Schemes — myscheme.gov.in</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#166534',
    gap: 10,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: '#fff', fontSize: 22, fontWeight: '700' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '900', color: '#fff' },
  headerSub: { fontSize: 11, color: '#bbf7d0', fontWeight: '600', marginTop: 1 },

  // Disclaimer
  disclaimerBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#bbf7d0',
  },
  disclaimerIcon: { fontSize: 14, marginTop: 1 },
  disclaimerText: { flex: 1, fontSize: 12, color: '#166534', fontWeight: '600', lineHeight: 17 },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 14,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, color: '#1e293b', fontWeight: '500' },
  searchClear: { fontSize: 16, color: '#94a3b8', paddingHorizontal: 4 },

  // Filter
  filterRow: { marginBottom: 4 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  filterChipActive: { backgroundColor: '#166534', borderColor: '#166534' },
  filterEmoji: { fontSize: 13 },
  filterLabel: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  filterLabelActive: { color: '#fff' },

  resultCount: { fontSize: 12, color: '#94a3b8', fontWeight: '600', marginLeft: 14, marginBottom: 10, marginTop: 6 },

  // Cards
  card: {
    marginHorizontal: 14,
    marginBottom: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    gap: 12,
  },
  cardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardEmoji: { fontSize: 24 },
  cardTitles: { flex: 1 },
  cardNameRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' },
  cardName: { fontSize: 14, fontWeight: '900', flexShrink: 1 },
  tagBadge: { borderRadius: 50, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  cardNameHindi: { fontSize: 12, color: '#64748b', fontWeight: '600', marginTop: 2 },
  cardCategory: { fontSize: 11, color: '#94a3b8', fontWeight: '600', marginTop: 2 },
  expandIcon: { fontSize: 12, color: '#94a3b8', marginTop: 4 },

  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '600', marginBottom: 3 },
  statValue: { fontSize: 11, fontWeight: '800', textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: 'rgba(0,0,0,0.08)', marginVertical: 4 },

  // Expanded
  expandedSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    padding: 14,
    gap: 14,
  },
  detailRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  detailIcon: { fontSize: 16, marginTop: 1 },
  detailContent: { flex: 1 },
  detailTitle: { fontSize: 13, fontWeight: '800', color: '#1e293b', marginBottom: 6 },
  detailText: { fontSize: 12, color: '#475569', fontWeight: '500', lineHeight: 18 },
  bulletRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  bullet: { fontSize: 13, color: '#64748b', marginTop: 1 },
  bulletText: { flex: 1, fontSize: 12, color: '#475569', fontWeight: '500', lineHeight: 18 },

  // Terms Grid
  termsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  termBox: {
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  termLabel: { fontSize: 10, color: '#64748b', fontWeight: '700', marginBottom: 4 },
  termValue: { fontSize: 12, fontWeight: '800', lineHeight: 16 },

  // Apply Box
  applyBox: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  applyTitle: { fontSize: 13, fontWeight: '800', color: '#1e293b', marginBottom: 6 },
  applyText: { fontSize: 12, color: '#475569', fontWeight: '500', lineHeight: 18 },

  // Official Button
  officialBtn: {
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  officialBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  officialBtnUrl: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '600' },

  // Footer
  footer: {
    margin: 14,
    backgroundColor: '#fffbeb',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fde68a',
    gap: 10,
  },
  footerTitle: { fontSize: 14, fontWeight: '800', color: '#92400e' },
  footerText: { fontSize: 12, color: '#78350f', lineHeight: 18, fontWeight: '500' },
  nabardBtn: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  nabardBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  myschemeBtn: {
    backgroundColor: '#166534',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  myschemeBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
