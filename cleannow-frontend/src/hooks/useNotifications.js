// =====================================
// ÉTAPE 15 : Hook useNotifications
// =====================================
// Créez src/hooks/useNotifications.js :

import { useState, useEffect } from 'react';
import { profilAPI } from '../api/axios';

export default function useNotifications(userId, enabled = true) {
  const [notifications, setNotifications] = useState({
    unreadCount: 0,
    demandesNonLues: [],
    demandesAValider: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !userId) return;

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const res = await profilAPI.getNotificationsFournisseur(userId);
        setNotifications(res.data);
      } catch (err) {
        console.error('Erreur notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    // Fetch initial
    fetchNotifications();

    // Polling toutes les 30 secondes
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [userId, enabled]);

  return { notifications, loading };
}