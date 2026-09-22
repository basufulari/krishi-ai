import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert as RNAlert,
  ScrollView,
  FlatList,
  RefreshControl,
  Clipboard,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../config';

type UserRecord = {
  id: string;
  phone: string;
  name: string;
  role: 'farmer' | 'admin' | string;
  hashedPin: string;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  onBack: () => void;
};

const ADMIN_TOKEN_KEY = 'krishi_ai_admin_token';

export function AdminUserListScreen({ onBack }: Props) {
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'all' | 'farmer' | 'admin'>('all');
  const [showHashes, setShowHashes] = useState<Record<string, boolean>>({});

  // Check stored admin token on mount
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem(ADMIN_TOKEN_KEY);
        if (token) {
          setAdminToken(token);
          setIsAuthenticated(true);
          fetchUsers(token);
        }
      } catch {
        // ignore
      }
    };
    checkToken();
  }, []);

  const handleAdminLogin = async () => {
    if (!adminPhone.trim() || !adminPin.trim()) {
      RNAlert.alert('Authentication Error', 'Please enter both Admin Phone and PIN.');
      return;
    }

    setIsAuthenticating(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: adminPhone.trim(), pin: adminPin.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        await AsyncStorage.setItem(ADMIN_TOKEN_KEY, data.token);
        setAdminToken(data.token);
        setIsAuthenticated(true);
        fetchUsers(data.token);
      } else {
        RNAlert.alert('Access Denied', data.error || 'Invalid Admin Credentials.');
      }
    } catch {
      RNAlert.alert('Connection Error', 'Failed to connect to backend server. Make sure MongoDB and backend are running.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleAdminLogout = async () => {
    await AsyncStorage.removeItem(ADMIN_TOKEN_KEY);
    setAdminToken(null);
    setIsAuthenticated(false);
    setUsers([]);
  };

  const fetchUsers = async (token: string) => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      } else if (res.status === 401 || res.status === 403) {
        RNAlert.alert('Session Expired', 'Admin session expired. Please authenticate again.');
        handleAdminLogout();
      } else {
        RNAlert.alert('Error', data.error || 'Failed to fetch user database.');
      }
    } catch {
      RNAlert.alert('Error', 'Network error while fetching user database.');
    } finally {
      setIsLoadingUsers(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    if (adminToken) {
      setRefreshing(true);
      fetchUsers(adminToken);
    }
  };

  const toggleHashVisibility = (id: string) => {
    setShowHashes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    RNAlert.alert('Copied!', `${label} copied to clipboard.`);
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phone.includes(searchQuery);

      const matchesRole =
        selectedRoleFilter === 'all' || u.role.toLowerCase() === selectedRoleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, selectedRoleFilter]);

  const totalFarmers = useMemo(() => users.filter((u) => u.role === 'farmer').length, [users]);
  const totalAdmins = useMemo(() => users.filter((u) => u.role === 'admin').length, [users]);

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTextGroup}>
          <Text style={styles.headerTitle}>Database Administrator</Text>
          <Text style={styles.headerSubtitle}>User Security & Account Vault</Text>
        </View>
        {isAuthenticated && (
          <TouchableOpacity style={styles.logoutBadge} onPress={handleAdminLogout}>
            <Text style={styles.logoutBadgeText}>Lock Admin</Text>
          </TouchableOpacity>
        )}
      </View>

      {!isAuthenticated ? (
        <ScrollView contentContainerStyle={styles.authScroll}>
          <View style={styles.authCard}>
            <View style={styles.shieldIconContainer}>
              <Text style={styles.shieldEmoji}>🛡️</Text>
            </View>
            <Text style={styles.authCardTitle}>Database Admin Access</Text>
            <Text style={styles.authCardDesc}>
              Enter your Administrator phone number and PIN to decrypt and inspect stored database user records.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Admin Phone (Username)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 9876543210"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
                value={adminPhone}
                onChangeText={setAdminPhone}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Admin Security PIN</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter 4-digit PIN"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                keyboardType="numeric"
                value={adminPin}
                onChangeText={setAdminPin}
              />
            </View>

            <TouchableOpacity
              style={[styles.authSubmitBtn, isAuthenticating && styles.authSubmitBtnDisabled]}
              onPress={handleAdminLogin}
              disabled={isAuthenticating}
            >
              {isAuthenticating ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.authSubmitBtnText}>Authenticate as DB Admin</Text>
              )}
            </TouchableOpacity>

            <View style={styles.securityNoticeBox}>
              <Text style={styles.securityNoticeText}>
                🔒 Security Note: Access is protected via JWT Authorization tokens and logged for security auditing.
              </Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.container}>
          {/* Top Stats Overview */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: '#0f172a' }]}>
              <Text style={styles.statNumber}>{users.length}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#065f46' }]}>
              <Text style={styles.statNumber}>{totalFarmers}</Text>
              <Text style={styles.statLabel}>Farmers</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#5b21b6' }]}>
              <Text style={styles.statNumber}>{totalAdmins}</Text>
              <Text style={styles.statLabel}>Admins</Text>
            </View>
          </View>

          {/* Search and Filters */}
          <View style={styles.filterSection}>
            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search user by name or phone..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={styles.clearSearchText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.tabGroup}>
              <TouchableOpacity
                style={[styles.filterTab, selectedRoleFilter === 'all' && styles.filterTabActive]}
                onPress={() => setSelectedRoleFilter('all')}
              >
                <Text style={[styles.filterTabText, selectedRoleFilter === 'all' && styles.filterTabTextActive]}>
                  All ({users.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterTab, selectedRoleFilter === 'farmer' && styles.filterTabActive]}
                onPress={() => setSelectedRoleFilter('farmer')}
              >
                <Text style={[styles.filterTabText, selectedRoleFilter === 'farmer' && styles.filterTabTextActive]}>
                  Farmers ({totalFarmers})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterTab, selectedRoleFilter === 'admin' && styles.filterTabActive]}
                onPress={() => setSelectedRoleFilter('admin')}
              >
                <Text style={[styles.filterTabText, selectedRoleFilter === 'admin' && styles.filterTabTextActive]}>
                  Admins ({totalAdmins})
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* User List */}
          {isLoadingUsers && !refreshing ? (
            <View style={styles.centerLoading}>
              <ActivityIndicator size="large" color="#059669" />
              <Text style={styles.loadingText}>Fetching MongoDB database records...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredUsers}
              keyExtractor={(item) => item.id}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyEmoji}>📁</Text>
                  <Text style={styles.emptyTitle}>No matching users found</Text>
                  <Text style={styles.emptySub}>Try adjusting your search query or role filter.</Text>
                </View>
              }
              renderItem={({ item }) => {
                const isHashVisible = Boolean(showHashes[item.id]);
                const isAdmin = item.role === 'admin';

                return (
                  <View style={styles.userCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.avatarGroup}>
                        <View style={[styles.avatarCircle, isAdmin ? styles.avatarAdmin : styles.avatarFarmer]}>
                          <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                        </View>
                        <View>
                          <Text style={styles.userName}>{item.name}</Text>
                          <TouchableOpacity onPress={() => copyToClipboard(item.phone, 'Phone number')}>
                            <Text style={styles.userPhone}>📞 {item.phone} 📋</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={[styles.roleBadge, isAdmin ? styles.roleBadgeAdmin : styles.roleBadgeFarmer]}>
                        <Text style={[styles.roleBadgeText, isAdmin ? styles.roleBadgeTextAdmin : styles.roleBadgeTextFarmer]}>
                          {isAdmin ? '⚙️ ADMIN' : '🌾 FARMER'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardDivider} />

                    <View style={styles.cardBody}>
                      <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>User ID:</Text>
                        <TouchableOpacity onPress={() => copyToClipboard(item.id, 'User ID')}>
                          <Text style={styles.dataValueCode} numberOfLines={1}>{item.id}</Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>Created At:</Text>
                        <Text style={styles.dataValue}>{formatDate(item.createdAt)}</Text>
                      </View>

                      {/* Password Hash Box */}
                      <View style={styles.hashContainer}>
                        <View style={styles.hashHeaderRow}>
                          <Text style={styles.hashTitle}>🔑 Password Hash (bcrypt)</Text>
                          <TouchableOpacity style={styles.toggleBtn} onPress={() => toggleHashVisibility(item.id)}>
                            <Text style={styles.toggleBtnText}>{isHashVisible ? 'Hide Hash' : 'Show Hash'}</Text>
                          </TouchableOpacity>
                        </View>
                        {isHashVisible ? (
                          <TouchableOpacity style={styles.hashBox} onPress={() => copyToClipboard(item.hashedPin, 'Hashed PIN')}>
                            <Text style={styles.hashText}>{item.hashedPin}</Text>
                            <Text style={styles.copyHint}>Tap to copy hash</Text>
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.hashBoxHidden}>
                            <Text style={styles.hashHiddenText}>••••••••••••••••••••••••••••••••••••••••</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#334155',
  },
  backButtonText: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
  },
  headerTextGroup: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  logoutBadge: {
    backgroundColor: '#ef4444',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  logoutBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  authScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  authCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  shieldIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#059669',
  },
  shieldEmoji: {
    fontSize: 32,
  },
  authCardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 8,
  },
  authCardDesc: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 16,
  },
  inputLabel: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#f8fafc',
    fontSize: 15,
  },
  authSubmitBtn: {
    width: '100%',
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  authSubmitBtnDisabled: {
    opacity: 0.6,
  },
  authSubmitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  securityNoticeBox: {
    marginTop: 20,
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    width: '100%',
  },
  securityNoticeText: {
    color: '#64748b',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statNumber: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#f8fafc',
    paddingVertical: 10,
    fontSize: 14,
  },
  clearSearchText: {
    color: '#94a3b8',
    fontSize: 16,
    paddingHorizontal: 6,
  },
  tabGroup: {
    flexDirection: 'row',
    marginTop: 10,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterTabActive: {
    backgroundColor: '#059669',
  },
  filterTabText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  userCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFarmer: {
    backgroundColor: '#059669',
  },
  avatarAdmin: {
    backgroundColor: '#7c3aed',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  userName: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  userPhone: {
    color: '#38bdf8',
    fontSize: 13,
    marginTop: 2,
  },
  roleBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  roleBadgeFarmer: {
    backgroundColor: '#064e3b',
    borderWidth: 1,
    borderColor: '#059669',
  },
  roleBadgeAdmin: {
    backgroundColor: '#4c1d95',
    borderWidth: 1,
    borderColor: '#7c3aed',
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  roleBadgeTextFarmer: {
    color: '#6ee7b7',
  },
  roleBadgeTextAdmin: {
    color: '#c4b5fd',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 12,
  },
  cardBody: {
    gap: 8,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dataLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  dataValue: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  dataValueCode: {
    color: '#a7f3d0',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  hashContainer: {
    marginTop: 6,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  hashHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  hashTitle: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
  },
  toggleBtn: {
    backgroundColor: '#334155',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  toggleBtnText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  hashBox: {
    backgroundColor: '#182234',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#059669',
  },
  hashText: {
    color: '#34d399',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 15,
  },
  copyHint: {
    color: '#64748b',
    fontSize: 9,
    textAlign: 'right',
    marginTop: 4,
  },
  hashBoxHidden: {
    backgroundColor: '#0f172a',
    padding: 6,
    borderRadius: 6,
  },
  hashHiddenText: {
    color: '#475569',
    fontSize: 12,
    letterSpacing: 2,
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyEmoji: {
    fontSize: 44,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  emptySub: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
  },
});
