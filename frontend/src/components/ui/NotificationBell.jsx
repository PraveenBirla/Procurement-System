import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import api from '../../services/api';
import authService from '../../services/authService';
import './NotificationBell.css';

export const NotificationBell = ({ setActiveSection }) => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const user = authService.getUser();
                const role = user ? user.role : '';
                const res = await api.get(`/notifications?role=${role}`);
                if (res.data && res.data.data) {
                    setNotifications(res.data.data);
                }
            } catch (err) {
                console.error("Failed to load notifications", err);
            }
        };
        fetchNotifications();
    }, [setNotifications]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.post(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.post('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) markAsRead(notification.id);
        
        if (setActiveSection) {
            const role = authService.getRole();
            const type = notification.type || "";
            
            if (type.includes("NEW_REQUISITION")) {
                setActiveSection("pending");
            } else if (type.includes("REQUISITION_APPROVED")) {
                if (role === "ROLE_EMPLOYEE") setActiveSection("requition");
                else if (role === "ROLE_PROCUREMENT") setActiveSection("ApprovedRequition");
                else setActiveSection("pending");
            } else if (type.includes("REQUISITION_REJECTED")) {
                if (role === "ROLE_EMPLOYEE") setActiveSection("requition");
                else setActiveSection("rejected");
            } else if (type.includes("PO_GENERATED") || type.includes("NEW_PURCHASE_ORDER")) {
                setActiveSection("orders");
            } else if (type.includes("ORDER_ACCEPTED") || type.includes("ORDER_REJECTED")) {
                setActiveSection("PurchaseOrders");
            } else if (type.includes("ORDER_DELIVERED")) {
                setActiveSection("DeliveredOrders");
            } else if (type.includes("ORDER_COMPLETED")) {
                setActiveSection("CompletedOrders");
            }
            setIsOpen(false);
        }
    };

    return (
        <div className="notification-bell-container" ref={dropdownRef}>
            <button className="notification-bell-btn" onClick={() => setIsOpen(!isOpen)}>
                <Bell size={24} />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button className="mark-all-btn" onClick={markAllAsRead}>
                                <Check size={14} /> Mark all read
                            </button>
                        )}
                    </div>
                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div className="empty-notifications">No new notifications</div>
                        ) : (
                            notifications.map(notification => (
                                <div 
                                    key={notification.id} 
                                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="notification-content">
                                        <div className="notification-type">{notification.type}</div>
                                        <div className="notification-message">{notification.message}</div>
                                        <div className="notification-time">
                                            {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    {!notification.isRead && <div className="unread-dot"></div>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
