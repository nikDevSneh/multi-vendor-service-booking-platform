

import React, { useEffect, useState } from "react";
import api from "./api";
import "./App.css";

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

/* =========================================================
   HELPERS
========================================================= */

function StatusBadge({ status }) {
  return (
    <span className={`booking-status ${(status || "").toLowerCase()}`}>
      {status}
    </span>
  );
}


/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function AdminDashboard({ token, user, onLogout }) {
  const [stats, setStats] = useState({ users: 0, services: 0, bookings: 0 });
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsResponse, usersResponse, servicesResponse, bookingsResponse] = await Promise.all([
        api.get("/api/admin/stats"),
        api.get("/api/admin/users"),
        api.get("/api/admin/services"),
        api.get("/api/admin/bookings"),
      ]);
      setStats(statsResponse.data || {});
      setUsers(usersResponse.data || []);
      setServices(servicesResponse.data || []);
      setBookings(bookingsResponse.data || []);
    } catch (error) {
      console.error("Admin dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const filteredUsers = users.filter((u) =>
    `${u.id || ""} ${u.email || ""} ${u.fullName || ""} ${u.role || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const filteredServices = services.filter((s) =>
    `${s.id || ""} ${s.title || ""} ${s.description || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const filteredBookings = bookings.filter((b) =>
    `${b.id || ""} ${b.status || ""} ${b.serviceTitle || b.service?.title || ""} ${b.customer?.email || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const roleCount = (role) => users.filter((u) => u.role === role).length;

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e4e7ec",
    borderRadius: "16px",
    padding: "22px",
  };

  const tabStyle = (active) => ({
    border: "none",
    borderRadius: "9px",
    padding: "10px 17px",
    background: active ? "#101828" : "transparent",
    color: active ? "#ffffff" : "#667085",
    fontWeight: "600",
    cursor: "pointer",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7fa", color: "#101828" }}>
      <nav style={{ height: "80px", background: "#ffffff", borderBottom: "1px solid #e4e7ec", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 6%", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "46px", height: "46px", borderRadius: "14px", background: "#101828", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "21px" }}>S</div>
          <div>
            <div style={{ fontSize: "21px", fontWeight: "700" }}>ServiceHub</div>
            <div style={{ fontSize: "11px", color: "#98a2b3", letterSpacing: "1px" }}>ADMIN CONSOLE</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "13px", background: "#101828", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>{(user?.fullName || "A").charAt(0).toUpperCase()}</div>
          <div><strong style={{ display: "block", fontSize: "14px" }}>{user?.fullName || "Administrator"}</strong><span style={{ fontSize: "12px", color: "#98a2b3" }}>Administrator</span></div>
          <button onClick={onLogout} style={{ marginLeft: "10px", background: "#fff", border: "1px solid #d0d5dd", borderRadius: "10px", padding: "10px 17px", cursor: "pointer", fontWeight: "600" }}>Logout</button>
        </div>
      </nav>

      <main style={{ maxWidth: "1240px", margin: "0 auto", padding: "48px 30px 70px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "25px", marginBottom: "28px" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "1.8px", color: "#667085", marginBottom: "9px" }}>ADMIN DASHBOARD</div>
            <h1 style={{ margin: 0, fontSize: "42px", letterSpacing: "-1.5px" }}>Platform overview</h1>
            <p style={{ margin: "10px 0 0", color: "#667085" }}>Monitor users, services and bookings from one place.</p>
          </div>
          <button onClick={loadAdminData} style={{ background: "#fff", border: "1px solid #d0d5dd", borderRadius: "11px", padding: "12px 18px", fontWeight: "600", cursor: "pointer" }}>↻ Refresh</button>
        </div>

        <div style={{ display: "flex", gap: "6px", background: "#fff", border: "1px solid #e4e7ec", borderRadius: "12px", padding: "5px", width: "fit-content", marginBottom: "28px" }}>
          {["overview", "users", "services", "bookings"].map((tab) => (
            <button key={tab} onClick={() => { setActiveTab(tab); setSearch(""); }} style={tabStyle(activeTab === tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "16px", marginBottom: "20px" }}>
              {[
                ["TOTAL USERS", stats.users ?? users.length, "Registered accounts"],
                ["TOTAL SERVICES", stats.services ?? services.length, "Published services"],
                ["TOTAL BOOKINGS", stats.bookings ?? bookings.length, "Platform bookings"],
              ].map(([label, value, note]) => (
                <div key={label} style={cardStyle}>
                  <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "1px", color: "#667085" }}>{label}</div>
                  <div style={{ fontSize: "34px", fontWeight: "700", marginTop: "12px" }}>{loading ? "—" : value}</div>
                  <div style={{ color: "#98a2b3", fontSize: "12px", marginTop: "5px" }}>{note}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
              <div style={cardStyle}>
                <h2 style={{ margin: 0, fontSize: "19px" }}>User breakdown</h2>
                <p style={{ margin: "5px 0 20px", color: "#667085", fontSize: "13px" }}>Accounts by platform role.</p>
                {[["Customers", "ROLE_CUSTOMER"], ["Vendors", "ROLE_VENDOR"], ["Admins", "ROLE_ADMIN"]].map(([label, role]) => (
                  <div key={role} style={{ display: "flex", justifyContent: "space-between", padding: "13px 0", borderTop: "1px solid #f2f4f7" }}>
                    <span>{label}</span><strong>{roleCount(role)}</strong>
                  </div>
                ))}
              </div>
              <div style={cardStyle}>
                <h2 style={{ margin: 0, fontSize: "19px" }}>Booking activity</h2>
                <p style={{ margin: "5px 0 20px", color: "#667085", fontSize: "13px" }}>Current booking status distribution.</p>
                {[["Pending", "PENDING"], ["Confirmed", "CONFIRMED"], ["Completed", "COMPLETED"], ["Cancelled", "CANCELLED"]].map(([label, status]) => (
                  <div key={status} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderTop: "1px solid #f2f4f7" }}>
                    <span>{label}</span><strong>{bookings.filter((b) => b.status === status).length}</strong>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab !== "overview" && (
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", marginBottom: "22px" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "22px" }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
                <p style={{ margin: "5px 0 0", color: "#667085", fontSize: "13px" }}>Search and review platform {activeTab}.</p>
              </div>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${activeTab}...`} style={{ width: "260px", padding: "11px 14px", border: "1px solid #d0d5dd", borderRadius: "10px", outline: "none" }} />
            </div>

            {activeTab === "users" && (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["ID", "NAME", "EMAIL", "ROLE"].map((h) => <th key={h} style={{ textAlign: "left", padding: "12px", fontSize: "10px", color: "#98a2b3", letterSpacing: "1px", borderBottom: "1px solid #eaecf0" }}>{h}</th>)}</tr></thead>
                  <tbody>{filteredUsers.map((u) => <tr key={u.id}><td style={{ padding: "15px 12px", borderBottom: "1px solid #f2f4f7" }}>#{u.id}</td><td style={{ padding: "15px 12px", borderBottom: "1px solid #f2f4f7", fontWeight: "600" }}>{u.fullName || "—"}</td><td style={{ padding: "15px 12px", borderBottom: "1px solid #f2f4f7" }}>{u.email}</td><td style={{ padding: "15px 12px", borderBottom: "1px solid #f2f4f7" }}>{u.role}</td></tr>)}</tbody>
                </table>
              </div>
            )}

            {activeTab === "services" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "14px" }}>
                {filteredServices.map((s) => <div key={s.id} style={{ border: "1px solid #eaecf0", borderRadius: "13px", padding: "18px" }}><div style={{ color: "#98a2b3", fontSize: "10px", letterSpacing: "1px" }}>SERVICE #{s.id}</div><h3 style={{ margin: "8px 0 6px" }}>{s.title || "Service"}</h3><p style={{ margin: "0 0 15px", color: "#667085", fontSize: "13px" }}>{s.description || "No description"}</p><strong>₹{s.price ?? "—"}</strong>{s.durationMinutes && <span style={{ color: "#98a2b3", marginLeft: "10px", fontSize: "12px" }}>{s.durationMinutes} min</span>}</div>)}
              </div>
            )}

            {activeTab === "bookings" && (
              <div style={{ display: "grid", gap: "12px" }}>
                {filteredBookings.map((b) => <div key={b.id} style={{ border: "1px solid #eaecf0", borderRadius: "13px", padding: "18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px" }}><div><div style={{ fontSize: "10px", color: "#98a2b3", letterSpacing: "1px" }}>BOOKING #{b.id}</div><strong style={{ display: "block", marginTop: "6px" }}>{b.serviceTitle || b.service?.title || "Service"}</strong><span style={{ display: "block", marginTop: "5px", color: "#667085", fontSize: "12px" }}>{b.startTime ? new Date(b.startTime).toLocaleString("en-IN") : "—"}</span></div><StatusBadge status={b.status} /></div>)}
              </div>
            )}

            {((activeTab === "users" && filteredUsers.length === 0) || (activeTab === "services" && filteredServices.length === 0) || (activeTab === "bookings" && filteredBookings.length === 0)) && <div style={{ textAlign: "center", padding: "50px", color: "#667085" }}>No matching records found.</div>}
          </div>
        )}
      </main>

      <footer style={{ borderTop: "1px solid #e4e7ec", background: "#fff", padding: "24px 6%", display: "flex", justifyContent: "space-between", color: "#98a2b3", fontSize: "12px" }}>
        <span>© 2026 ServiceHub</span><span>Administration Console</span>
      </footer>
    </div>
  );
}


/* =========================================================
   CUSTOMER DASHBOARD
========================================================= */

function CustomerDashboard({
  token,
  user,
  bookings,
  onRefresh,
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [bookingFilter, setBookingFilter] = useState("ALL");
  const [services, setServices] = useState([]);
  const [serviceSearch, setServiceSearch] = useState("");
  const [servicesLoading, setServicesLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingTime, setBookingTime] = useState("");
  const [showBooking, setShowBooking] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const safeBookings = Array.isArray(bookings) ? bookings : [];

  const loadServices = async () => {
    try {
      setServicesLoading(true);
      const response = await api.get("/api/services");
      setServices(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Customer services error:", error);
    } finally {
      setServicesLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const now = new Date();

  const getBookingDate = (booking) =>
    booking.startTime ? new Date(booking.startTime) : null;

  const upcomingBookings = safeBookings.filter((booking) => {
    const date = getBookingDate(booking);
    return (
      date &&
      date >= now &&
      booking.status !== "CANCELLED" &&
      booking.status !== "COMPLETED"
    );
  });

  const completedBookings = safeBookings.filter(
    (booking) => booking.status === "COMPLETED"
  );

  const cancelledBookings = safeBookings.filter(
    (booking) => booking.status === "CANCELLED"
  );

  const filteredBookings = safeBookings
    .filter((booking) => {
      if (bookingFilter === "ALL") return true;
      return booking.status === bookingFilter;
    })
    .sort((a, b) => {
      const dateA = getBookingDate(a)?.getTime() || 0;
      const dateB = getBookingDate(b)?.getTime() || 0;
      return dateB - dateA;
    });

  const filteredServices = services.filter((service) => {
    const text = `${service.title || ""} ${service.description || ""}`.toLowerCase();
    return text.includes(serviceSearch.toLowerCase());
  });

  const formatDate = (dateString) => {
    if (!dateString) return "—";

    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "—";

    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitial = () =>
    (user?.fullName || "U").charAt(0).toUpperCase();

  const statusStyle = (status) => {
    switch (status) {
      case "CONFIRMED":
        return {
          background: "#eaf2ff",
          color: "#2563eb",
          dot: "#2563eb",
        };
      case "COMPLETED":
        return {
          background: "#e8f8ef",
          color: "#087443",
          dot: "#16a34a",
        };
      case "CANCELLED":
        return {
          background: "#fff0f0",
          color: "#c62828",
          dot: "#ef4444",
        };
      default:
        return {
          background: "#fff7e6",
          color: "#b45309",
          dot: "#f59e0b",
        };
    }
  };

  const openBooking = (service) => {
    setSelectedService(service);
    setBookingTime("");
    setShowBooking(true);
  };

  const closeBooking = () => {
    if (bookingLoading) return;
    setShowBooking(false);
    setSelectedService(null);
    setBookingTime("");
  };

  const createBooking = async (e) => {
    e.preventDefault();

    if (!selectedService || !bookingTime) {
      return;
    }

    try {
      setBookingLoading(true);

      const params = new URLSearchParams();
      params.append("serviceId", selectedService.id);
      params.append("startTime", bookingTime);

      await api.post(
        `/api/bookings?${params.toString()}`
      );

      closeBooking();
      await onRefresh();
      alert("Booking created successfully!");
    } catch (error) {
      console.error("Booking error:", error);
      alert(
        error.response?.data?.message ||
          "Unable to create booking. Please try another time."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fa",
        color: "#101828",
      }}
    >
      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav
        style={{
          height: "80px",
          background: "#ffffff",
          borderBottom: "1px solid #e4e7ec",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 6%",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "14px",
              background: "#101828",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "21px",
              fontWeight: "700",
            }}
          >
            S
          </div>

          <div>
            <div
              style={{
                fontSize: "21px",
                fontWeight: "700",
                letterSpacing: "-0.5px",
              }}
            >
              ServiceHub
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "#98a2b3",
                letterSpacing: "0.7px",
              }}
            >
              SERVICE MARKETPLACE
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "13px",
              background: "#101828",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "700",
            }}
          >
            {getInitial()}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2px",
            }}
          >
            <strong style={{ fontSize: "14px" }}>
              {user?.fullName || "Customer"}
            </strong>
            <span style={{ fontSize: "12px", color: "#98a2b3" }}>
              Customer
            </span>
          </div>

          <button
            onClick={onLogout}
            style={{
              marginLeft: "8px",
              background: "#ffffff",
              border: "1px solid #d0d5dd",
              borderRadius: "10px",
              padding: "10px 17px",
              cursor: "pointer",
              fontWeight: "600",
              color: "#344054",
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "46px 30px 70px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "25px",
            marginBottom: "28px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "1.8px",
                color: "#667085",
                marginBottom: "9px",
              }}
            >
              CUSTOMER DASHBOARD
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "42px",
                lineHeight: "1.1",
                letterSpacing: "-1.5px",
              }}
            >
              Welcome back, {user?.fullName?.split(" ")[0] || "Customer"}.
            </h1>

            <p
              style={{
                margin: "10px 0 0",
                color: "#667085",
                fontSize: "16px",
              }}
            >
              Manage your bookings or find your next service.
            </p>
          </div>

          <button
            onClick={onRefresh}
            style={{
              background: "#ffffff",
              border: "1px solid #d0d5dd",
              borderRadius: "11px",
              padding: "12px 18px",
              fontWeight: "600",
              cursor: "pointer",
              color: "#344054",
              whiteSpace: "nowrap",
            }}
          >
            ↻ &nbsp; Refresh
          </button>
        </div>

        {/* =====================================================
            NAVIGATION TABS
        ===================================================== */}

        <div
          style={{
            display: "flex",
            gap: "6px",
            background: "#ffffff",
            border: "1px solid #e4e7ec",
            borderRadius: "12px",
            padding: "5px",
            width: "fit-content",
            marginBottom: "28px",
            flexWrap: "wrap",
          }}
        >
          {[
            ["overview", "Overview"],
            ["bookings", "My Bookings"],
            ["services", "Browse Services"],
            ["profile", "My Profile"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                border: "none",
                borderRadius: "8px",
                padding: "10px 17px",
                background:
                  activeTab === key ? "#101828" : "transparent",
                color:
                  activeTab === key ? "#ffffff" : "#667085",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* =====================================================
            OVERVIEW
        ===================================================== */}

        {activeTab === "overview" && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: "16px",
                marginBottom: "26px",
              }}
            >
              {[
                ["TOTAL BOOKINGS", safeBookings.length, "All your bookings"],
                ["UPCOMING", upcomingBookings.length, "Services ahead"],
                ["COMPLETED", completedBookings.length, "Services finished"],
                ["CANCELLED", cancelledBookings.length, "Cancelled bookings"],
              ].map(([label, value, subtext]) => (
                <div
                  key={label}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e4e7ec",
                    borderRadius: "16px",
                    padding: "22px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#667085",
                      fontWeight: "700",
                      letterSpacing: "0.7px",
                      marginBottom: "11px",
                    }}
                  >
                    {label}
                  </div>

                  <div style={{ fontSize: "32px", fontWeight: "700" }}>
                    {value}
                  </div>

                  <div
                    style={{
                      marginTop: "5px",
                      fontSize: "12px",
                      color: "#98a2b3",
                    }}
                  >
                    {subtext}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e4e7ec",
                borderRadius: "18px",
                padding: "28px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "22px",
                }}
              >
                <div>
                  <h2 style={{ margin: 0, fontSize: "20px" }}>
                    Upcoming bookings
                  </h2>
                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#667085",
                      fontSize: "13px",
                    }}
                  >
                    Your next scheduled services.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setActiveTab("bookings");
                    setBookingFilter("ALL");
                  }}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#344054",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  View all →
                </button>
              </div>

              {upcomingBookings.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "45px 20px",
                    background: "#f8fafc",
                    borderRadius: "14px",
                  }}
                >
                  <div style={{ fontSize: "30px", marginBottom: "10px" }}>
                    ✓
                  </div>
                  <h3 style={{ margin: "0 0 6px" }}>
                    You're all caught up
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      color: "#667085",
                      fontSize: "14px",
                    }}
                  >
                    You don't have any upcoming bookings.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: "15px",
                  }}
                >
                  {upcomingBookings.slice(0, 4).map((booking) => {
                    const status = statusStyle(booking.status);

                    return (
                      <div
                        key={booking.id}
                        style={{
                          border: "1px solid #eaecf0",
                          borderRadius: "14px",
                          padding: "20px",
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "15px",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#98a2b3",
                              fontWeight: "600",
                              letterSpacing: "0.7px",
                              marginBottom: "8px",
                            }}
                          >
                            BOOKING #{booking.id}
                          </div>

                          <h3 style={{ margin: "0 0 10px", fontSize: "17px" }}>
                            {booking.serviceTitle ||
                              booking.service?.title ||
                              "Service"}
                          </h3>

                          <div
                            style={{
                              color: "#667085",
                              fontSize: "13px",
                            }}
                          >
                            {formatDate(booking.startTime)} · {formatTime(booking.startTime)}
                          </div>
                        </div>

                        <div
                          style={{
                            alignSelf: "flex-start",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "7px 10px",
                            borderRadius: "20px",
                            background: status.background,
                            color: status.color,
                            fontSize: "10px",
                            fontWeight: "700",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: status.dot,
                            }}
                          />
                          {booking.status}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* =====================================================
            MY BOOKINGS
        ===================================================== */}

        {activeTab === "bookings" && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: "20px",
                marginBottom: "22px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "25px" }}>
                  My Bookings
                </h2>
                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#667085",
                    fontSize: "14px",
                  }}
                >
                  View and track all your service bookings.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  flexWrap: "wrap",
                }}
              >
                {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map(
                  (filter) => (
                    <button
                      key={filter}
                      onClick={() => setBookingFilter(filter)}
                      style={{
                        border:
                          bookingFilter === filter
                            ? "1px solid #101828"
                            : "1px solid #d0d5dd",
                        background:
                          bookingFilter === filter ? "#101828" : "#ffffff",
                        color:
                          bookingFilter === filter ? "#ffffff" : "#667085",
                        borderRadius: "9px",
                        padding: "8px 12px",
                        fontSize: "10px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      {filter}
                    </button>
                  )
                )}
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e4e7ec",
                  borderRadius: "18px",
                  padding: "70px 20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "58px",
                    height: "58px",
                    borderRadius: "16px",
                    background: "#f2f4f7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    fontSize: "25px",
                  }}
                >
                  □
                </div>
                <h3 style={{ margin: "0 0 7px" }}>No bookings found</h3>
                <p
                  style={{
                    margin: 0,
                    color: "#667085",
                    fontSize: "14px",
                  }}
                >
                  There are no bookings matching this filter.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: "18px",
                }}
              >
                {filteredBookings.map((booking) => {
                  const status = statusStyle(booking.status);

                  return (
                    <div
                      key={booking.id}
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e4e7ec",
                        borderRadius: "18px",
                        padding: "25px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "15px",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#98a2b3",
                              fontWeight: "600",
                              letterSpacing: "1px",
                              marginBottom: "9px",
                            }}
                          >
                            BOOKING #{booking.id}
                          </div>
                          <h3
                            style={{
                              margin: 0,
                              fontSize: "21px",
                              letterSpacing: "-0.4px",
                            }}
                          >
                            {booking.serviceTitle ||
                              booking.service?.title ||
                              "Service"}
                          </h3>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "8px 11px",
                            borderRadius: "20px",
                            background: status.background,
                            color: status.color,
                            fontSize: "10px",
                            fontWeight: "700",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: status.dot,
                            }}
                          />
                          {booking.status}
                        </div>
                      </div>

                      <div
                        style={{
                          height: "1px",
                          background: "#eaecf0",
                          margin: "22px 0",
                        }}
                      />

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1.2fr 1fr 1fr",
                          gap: "20px",
                        }}
                      >
                        <div>
                          <small
                            style={{
                              display: "block",
                              fontSize: "10px",
                              color: "#98a2b3",
                              letterSpacing: "0.8px",
                              fontWeight: "600",
                              marginBottom: "7px",
                            }}
                          >
                            DATE
                          </small>
                          <strong style={{ fontSize: "14px" }}>
                            {formatDate(booking.startTime)}
                          </strong>
                        </div>

                        <div>
                          <small
                            style={{
                              display: "block",
                              fontSize: "10px",
                              color: "#98a2b3",
                              letterSpacing: "0.8px",
                              fontWeight: "600",
                              marginBottom: "7px",
                            }}
                          >
                            START
                          </small>
                          <strong style={{ fontSize: "14px" }}>
                            {formatTime(booking.startTime)}
                          </strong>
                        </div>

                        <div>
                          <small
                            style={{
                              display: "block",
                              fontSize: "10px",
                              color: "#98a2b3",
                              letterSpacing: "0.8px",
                              fontWeight: "600",
                              marginBottom: "7px",
                            }}
                          >
                            END
                          </small>
                          <strong style={{ fontSize: "14px" }}>
                            {formatTime(booking.endTime)}
                          </strong>
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: "22px",
                          paddingTop: "15px",
                          borderTop: "1px solid #f2f4f7",
                          display: "flex",
                          justifyContent: "space-between",
                          color: "#98a2b3",
                          fontSize: "11px",
                        }}
                      >
                        <span>ServiceHub Booking</span>
                        <span>ID #{booking.id}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* =====================================================
            BROWSE SERVICES
        ===================================================== */}

        {activeTab === "services" && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: "20px",
                marginBottom: "24px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "25px" }}>Browse Services</h2>
                <p style={{ margin: "5px 0 0", color: "#667085", fontSize: "14px" }}>
                  Find a professional service and book it directly.
                </p>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #d0d5dd",
                  borderRadius: "10px",
                  padding: "0 13px",
                  display: "flex",
                  alignItems: "center",
                  width: "300px",
                }}
              >
                <span style={{ color: "#98a2b3", fontSize: "19px" }}>⌕</span>
                <input
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  placeholder="Search services..."
                  style={{
                    width: "100%",
                    border: "none",
                    outline: "none",
                    padding: "12px 9px",
                    fontSize: "13px",
                    background: "transparent",
                  }}
                />
              </div>
            </div>

            {servicesLoading ? (
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e4e7ec",
                  borderRadius: "18px",
                  padding: "65px 20px",
                  textAlign: "center",
                  color: "#667085",
                }}
              >
                Loading services...
              </div>
            ) : filteredServices.length === 0 ? (
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e4e7ec",
                  borderRadius: "18px",
                  padding: "65px 20px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "10px" }}>⌕</div>
                <h3 style={{ margin: "0 0 7px" }}>No services found</h3>
                <p style={{ margin: 0, color: "#667085", fontSize: "14px" }}>
                  Try another service name or search term.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: "18px",
                }}
              >
                {filteredServices.map((service) => (
                  <article
                    key={service.id}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e4e7ec",
                      borderRadius: "18px",
                      padding: "23px",
                      display: "flex",
                      flexDirection: "column",
                      minHeight: "245px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "12px",
                          background: "#f2f4f7",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "16px",
                        }}
                      >
                        ◆
                      </div>
                      <span
                        style={{
                          padding: "6px 9px",
                          background: "#f2f4f7",
                          borderRadius: "20px",
                          color: "#667085",
                          fontSize: "10px",
                          fontWeight: "600",
                        }}
                      >
                        Professional
                      </span>
                    </div>

                    <h3 style={{ margin: "0 0 8px", fontSize: "19px", letterSpacing: "-0.3px" }}>
                      {service.title}
                    </h3>

                    <p
                      style={{
                        margin: 0,
                        color: "#667085",
                        fontSize: "13px",
                        lineHeight: "1.6",
                        flex: 1,
                      }}
                    >
                      {service.description || "Professional service from a ServiceHub provider."}
                    </p>

                    <div
                      style={{
                        marginTop: "20px",
                        paddingTop: "15px",
                        borderTop: "1px solid #eaecf0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "15px",
                        }}
                      >
                        <strong style={{ fontSize: "17px" }}>₹{service.price}</strong>
                        <span style={{ color: "#667085", fontSize: "12px", fontWeight: "600" }}>
                          {service.durationMinutes} min
                        </span>
                      </div>

                      <button
                        onClick={() => openBooking(service)}
                        style={{
                          width: "100%",
                          border: "none",
                          borderRadius: "10px",
                          padding: "12px",
                          background: "#101828",
                          color: "#ffffff",
                          fontWeight: "700",
                          cursor: "pointer",
                        }}
                      >
                        Book Service
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {/* =====================================================
            PROFILE
        ===================================================== */}

        {activeTab === "profile" && (
          <div style={{ maxWidth: "760px" }}>
            <div style={{ marginBottom: "22px" }}>
              <h2 style={{ margin: 0, fontSize: "25px" }}>My Profile</h2>
              <p
                style={{
                  margin: "5px 0 0",
                  color: "#667085",
                  fontSize: "14px",
                }}
              >
                Your ServiceHub account information.
              </p>
            </div>

            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e4e7ec",
                borderRadius: "18px",
                padding: "32px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "18px",
                  paddingBottom: "28px",
                  borderBottom: "1px solid #eaecf0",
                  marginBottom: "28px",
                }}
              >
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "20px",
                    background: "#101828",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                    fontWeight: "700",
                  }}
                >
                  {getInitial()}
                </div>

                <div>
                  <h3 style={{ margin: 0, fontSize: "22px" }}>
                    {user?.fullName || "Customer"}
                  </h3>
                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#667085",
                      fontSize: "14px",
                    }}
                  >
                    ServiceHub Customer
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "25px",
                }}
              >
                <div>
                  <div className="profile-label">FULL NAME</div>
                  <div className="profile-value">
                    {user?.fullName || "—"}
                  </div>
                </div>

                <div>
                  <div className="profile-label">EMAIL ADDRESS</div>
                  <div className="profile-value" style={{ wordBreak: "break-word" }}>
                    {user?.email || "—"}
                  </div>
                </div>

                <div>
                  <div className="profile-label">ACCOUNT TYPE</div>
                  <div
                    style={{
                      display: "inline-flex",
                      padding: "6px 11px",
                      borderRadius: "20px",
                      background: "#f2f4f7",
                      color: "#344054",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    Customer
                  </div>
                </div>

                <div>
                  <div className="profile-label">TOTAL BOOKINGS</div>
                  <div className="profile-value">
                    {safeBookings.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =====================================================
          BOOKING MODAL
      ===================================================== */}

      {showBooking && selectedService && (
        <div
          onClick={closeBooking}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(16, 24, 40, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "470px",
              background: "#ffffff",
              borderRadius: "20px",
              padding: "30px",
              boxShadow: "0 25px 70px rgba(16, 24, 40, 0.22)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "20px",
                marginBottom: "24px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#98a2b3",
                    fontWeight: "700",
                    letterSpacing: "1px",
                    marginBottom: "8px",
                  }}
                >
                  BOOK A SERVICE
                </div>
                <h2 style={{ margin: 0, fontSize: "24px" }}>
                  {selectedService.title}
                </h2>
              </div>

              <button
                onClick={closeBooking}
                style={{
                  border: "none",
                  background: "#f2f4f7",
                  borderRadius: "9px",
                  width: "34px",
                  height: "34px",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  flex: 1,
                  background: "#f8fafc",
                  borderRadius: "11px",
                  padding: "13px",
                }}
              >
                <small style={{ color: "#98a2b3" }}>PRICE</small>
                <div style={{ marginTop: "4px", fontWeight: "700" }}>
                  ₹{selectedService.price}
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  background: "#f8fafc",
                  borderRadius: "11px",
                  padding: "13px",
                }}
              >
                <small style={{ color: "#98a2b3" }}>DURATION</small>
                <div style={{ marginTop: "4px", fontWeight: "700" }}>
                  {selectedService.durationMinutes} min
                </div>
              </div>
            </div>

            <form onSubmit={createBooking}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#344054",
                  marginBottom: "8px",
                }}
              >
                Select date and time
              </label>

              <input
                type="datetime-local"
                min={new Date().toISOString().slice(0, 16)}
                value={bookingTime}
                min={new Date().toISOString().slice(0, 16)}
                onChange={(e) => setBookingTime(e.target.value)}
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  border: "1px solid #d0d5dd",
                  borderRadius: "10px",
                  padding: "12px",
                  fontSize: "14px",
                  outline: "none",
                  marginBottom: "20px",
                }}
              />

              <button
                type="submit"
                disabled={bookingLoading}
                style={{
                  width: "100%",
                  border: "none",
                  borderRadius: "10px",
                  padding: "13px",
                  background: bookingLoading ? "#98a2b3" : "#101828",
                  color: "#ffffff",
                  fontWeight: "700",
                  cursor: bookingLoading ? "not-allowed" : "pointer",
                }}
              >
                {bookingLoading ? "Creating booking..." : "Confirm booking"}
              </button>

              <button
                type="button"
                onClick={closeBooking}
                disabled={bookingLoading}
                style={{
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  padding: "12px",
                  marginTop: "5px",
                  color: "#667085",
                  cursor: bookingLoading ? "not-allowed" : "pointer",
                  fontWeight: "600",
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      <footer
        style={{
          borderTop: "1px solid #e4e7ec",
          background: "#ffffff",
          padding: "24px 6%",
          display: "flex",
          justifyContent: "space-between",
          color: "#98a2b3",
          fontSize: "12px",
        }}
      >
        <span>© 2026 ServiceHub</span>
        <span>Professional services, simplified.</span>
      </footer>
    </div>
  );
}

/* =========================================================
   VENDOR DASHBOARD
========================================================= */

function VendorDashboard({
  token,
  user,
  onLogout,
  toast,
}) {
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [bookingFilter, setBookingFilter] = useState("ALL");
  const [serviceSearch, setServiceSearch] = useState("");

  const [profileForm, setProfileForm] = useState({
    businessName: "",
    description: "",
    category: "",
  });

  const [serviceForm, setServiceForm] = useState({
    title: "",
    description: "",
    price: "",
    durationMinutes: "",
  });

  const [showServiceForm, setShowServiceForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const loadVendorData = async () => {
    try {
      setProfileLoading(true);

      const [profileResponse, bookingsResponse] =
        await Promise.allSettled([
          api.get("/api/vendors/profile"),
          api.get("/api/bookings/vendor"),
        ]);

      if (profileResponse.status === "fulfilled") {
        const data = profileResponse.value.data;
        setProfile(data);
        setProfileForm({
          businessName: data.businessName || "",
          description: data.description || "",
          category: data.category || "",
        });
        setServices(Array.isArray(data.services) ? data.services : []);
      } else {
        setProfile(null);
        setServices([]);
      }

      if (bookingsResponse.status === "fulfilled") {
        setBookings(
          Array.isArray(bookingsResponse.value.data)
            ? bookingsResponse.value.data
            : []
        );
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error("Vendor dashboard error:", error);
      toast("Unable to load vendor dashboard");
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    loadVendorData();
  }, []);

  const createProfile = async (e) => {
    e.preventDefault();

    if (!profileForm.businessName.trim()) {
      toast("Business name is required");
      return;
    }

    if (!profileForm.category.trim()) {
      toast("Category is required");
      return;
    }

    setSaving(true);

    try {
      const params = new URLSearchParams();
      params.append("businessName", profileForm.businessName);
      params.append("description", profileForm.description);
      params.append("category", profileForm.category);

      await api.post(
        `/api/vendors/profile?${params.toString()}`
      );

      toast("Vendor profile created successfully");
      await loadVendorData();
    } catch (error) {
      toast(
        error.response?.data?.message ||
          "Unable to create profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const createService = async (e) => {
    e.preventDefault();

    const title = serviceForm.title.trim();
    const description = serviceForm.description.trim();
    const price = Number(serviceForm.price);
    const durationMinutes = Number(serviceForm.durationMinutes);

    if (!title) {
      toast("Service title is required");
      return;
    }

    if (title.length < 2) {
      toast("Service title must contain at least 2 characters");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      toast("Price must be greater than ₹0");
      return;
    }

    if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
      toast("Duration must be greater than 0 minutes");
      return;
    }

    if (durationMinutes > 1440) {
      toast("Duration cannot exceed 24 hours");
      return;
    }

    setSaving(true);

    try {
      const params = new URLSearchParams();
      params.append("title", serviceForm.title);
      params.append("description", serviceForm.description);
      params.append("price", serviceForm.price);
      params.append("durationMinutes", serviceForm.durationMinutes);

      await api.post(
        `/api/services?${params.toString()}`
      );

      toast("Service created successfully");
      setServiceForm({
        title: "",
        description: "",
        price: "",
        durationMinutes: "",
      });
      setShowServiceForm(false);
      await loadVendorData();
    } catch (error) {
      toast(
        error.response?.data?.message ||
          "Unable to create service"
      );
    } finally {
      setSaving(false);
    }
  };
  const editService = async (serviceId) => {
    if (!editingService) return;

    const title = (editingService.title || "").trim();
    const price = Number(editingService.price);
    const durationMinutes = Number(editingService.durationMinutes);

    if (!title) {
      toast("Service title is required");
      return;
    }

    if (title.length < 2) {
      toast("Service title must contain at least 2 characters");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      toast("Price must be greater than ₹0");
      return;
    }

    if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
      toast("Duration must be greater than 0 minutes");
      return;
    }

    if (durationMinutes > 1440) {
      toast("Duration cannot exceed 24 hours");
      return;
    }

    try {
      setSaving(true);

      const params = new URLSearchParams();
      params.append("title", editingService.title);
      params.append("description", editingService.description);
      params.append("price", editingService.price);
      params.append("durationMinutes", editingService.durationMinutes);

      const response = await api.put(
        `/api/services/${serviceId}`,
        null,
        { params }
      );

      setServices((prev) =>
        prev.map((service) =>
          service.id === serviceId ? response.data : service
        )
      );

      setEditingService(null);
      toast("Service updated successfully");
    } catch (error) {
      console.error("Update service error:", error);
      toast(
        error.response?.data?.message ||
        "Failed to update service"
      );
    } finally {
      setSaving(false);
    }
  };
  const deleteService = async (serviceId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this service?"
    );

    if (!confirmed) return;

    try {
      setSaving(true);

      await api.delete(
        `/api/services/${serviceId}`,
        {}
      );

      setServices((prev) =>
        prev.filter((service) => service.id !== serviceId)
      );

      toast("Service deleted successfully");
    } catch (error) {
      console.error("Delete service error:", error);

      toast(
        error.response?.data?.message ||
        "Unable to delete service. It may have existing bookings."
      );
    } finally {
      setSaving(false);
    }
  };

  const updateBooking = async (bookingId, status) => {
    try {
      await api.put(
        `/api/bookings/${bookingId}/status?status=${status}`
      );

      toast(`Booking marked as ${status.toLowerCase()}`);
      await loadVendorData();
    } catch (error) {
      toast(
        error.response?.data?.message ||
          "Unable to update booking"
      );
    }
  };

  const safeBookings = Array.isArray(bookings) ? bookings : [];
  const safeServices = Array.isArray(services) ? services : [];

  const pendingBookings = safeBookings.filter(
    (booking) => booking.status === "PENDING"
  );

  const confirmedBookings = safeBookings.filter(
    (booking) => booking.status === "CONFIRMED"
  );

  const completedBookings = safeBookings.filter(
    (booking) => booking.status === "COMPLETED"
  );

  const cancelledBookings = safeBookings.filter(
    (booking) => booking.status === "CANCELLED"
  );

  const filteredServices = safeServices.filter((service) =>
    `${service.title || ""} ${service.description || ""}`
      .toLowerCase()
      .includes(serviceSearch.toLowerCase())
  );

  const filteredBookings = safeBookings.filter((booking) => {
    if (bookingFilter === "ALL") return true;
    return booking.status === bookingFilter;
  });

  const formatDate = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusStyle = (status) => {
    if (status === "CONFIRMED") {
      return { background: "#eaf2ff", color: "#2563eb", dot: "#2563eb" };
    }
    if (status === "COMPLETED") {
      return { background: "#e8f8ef", color: "#087443", dot: "#16a34a" };
    }
    if (status === "CANCELLED") {
      return { background: "#fff0f0", color: "#c62828", dot: "#ef4444" };
    }
    return { background: "#fff7e6", color: "#b45309", dot: "#f59e0b" };
  };

  const StatusPill = ({ status }) => {
    const style = statusStyle(status);
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "7px 11px",
          borderRadius: "999px",
          background: style.background,
          color: style.color,
          fontSize: "10px",
          fontWeight: "700",
          letterSpacing: "0.3px",
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: style.dot,
          }}
        />
        {status || "PENDING"}
      </span>
    );
  };

  const StatCard = ({ label, value, hint }) => (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e4e7ec",
        borderRadius: "16px",
        padding: "22px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          color: "#667085",
          fontWeight: "700",
          letterSpacing: "1px",
          marginBottom: "12px",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "30px", fontWeight: "700" }}>
        {value}
      </div>
      <div
        style={{
          marginTop: "5px",
          color: "#98a2b3",
          fontSize: "12px",
        }}
      >
        {hint}
      </div>
    </div>
  );

  if (profileLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f5f7fa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#667085",
        }}
      >
        Loading your vendor dashboard...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fa",
        color: "#101828",
      }}
    >
      {/* NAVBAR */}
      <nav
        style={{
          minHeight: "80px",
          background: "#ffffff",
          borderBottom: "1px solid #e4e7ec",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 6%",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "14px",
              background: "#101828",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "700",
              fontSize: "21px",
            }}
          >
            S
          </div>
          <div>
            <div style={{ fontSize: "21px", fontWeight: "700" }}>
              ServiceHub
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "#98a2b3",
                letterSpacing: "1px",
              }}
            >
              VENDOR PORTAL
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "13px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "13px",
              background: "#101828",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "700",
            }}
          >
            {(user?.fullName || "V").charAt(0).toUpperCase()}
          </div>
          <div>
            <strong style={{ display: "block", fontSize: "14px" }}>
              {user?.fullName || "Vendor"}
            </strong>
            <span style={{ fontSize: "12px", color: "#98a2b3" }}>
              Vendor
            </span>
          </div>
          <button
            onClick={onLogout}
            style={{
              marginLeft: "8px",
              background: "#ffffff",
              border: "1px solid #d0d5dd",
              borderRadius: "10px",
              padding: "10px 16px",
              fontWeight: "600",
              color: "#344054",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <main
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "46px 30px 70px",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "25px",
            marginBottom: "28px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "1.7px",
                color: "#667085",
                marginBottom: "9px",
              }}
            >
              VENDOR DASHBOARD
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: "42px",
                lineHeight: "1.1",
                letterSpacing: "-1.5px",
              }}
            >
              Manage your business.
            </h1>
            <p style={{ margin: "10px 0 0", color: "#667085" }}>
              Keep your services, profile and customer bookings organized.
            </p>
          </div>

          <button
            onClick={loadVendorData}
            style={{
              background: "#ffffff",
              border: "1px solid #d0d5dd",
              borderRadius: "11px",
              padding: "12px 18px",
              fontWeight: "600",
              color: "#344054",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            ↻ Refresh
          </button>
        </div>

        {/* TABS */}
        <div
          style={{
            display: "flex",
            gap: "5px",
            background: "#ffffff",
            border: "1px solid #e4e7ec",
            borderRadius: "12px",
            padding: "5px",
            width: "fit-content",
            marginBottom: "28px",
          }}
        >
          {[
            ["overview", "Overview"],
            ["services", "My Services"],
            ["bookings", "Bookings"],
            ["profile", "Business Profile"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                border: "none",
                borderRadius: "8px",
                padding: "10px 17px",
                background: activeTab === key ? "#101828" : "transparent",
                color: activeTab === key ? "#ffffff" : "#667085",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {!profile ? (
          <section
            style={{
              background: "#ffffff",
              border: "1px solid #e4e7ec",
              borderRadius: "18px",
              padding: "32px",
              maxWidth: "760px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "1.4px",
                color: "#667085",
              }}
            >
              GET STARTED
            </div>
            <h2 style={{ margin: "8px 0 7px", fontSize: "25px" }}>
              Create your business profile
            </h2>
            <p style={{ margin: "0 0 25px", color: "#667085" }}>
              Add your business details before publishing services.
            </p>

            <form
              onSubmit={createProfile}
              style={{ display: "grid", gap: "14px" }}
            >
              <input
                placeholder="Business name"
                value={profileForm.businessName}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    businessName: e.target.value,
                  })
                }
                required
                style={formInputStyle}
              />
              <input
                placeholder="Category"
                value={profileForm.category}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    category: e.target.value,
                  })
                }
                required
                style={formInputStyle}
              />
              <textarea
                placeholder="Business description"
                value={profileForm.description}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    description: e.target.value,
                  })
                }
                required
                rows="5"
                style={formInputStyle}
              />
              <button
                type="submit"
                disabled={saving}
                style={primaryButtonStyle}
              >
                {saving ? "Creating..." : "Create Profile"}
              </button>
            </form>
          </section>
        ) : (
          <>
            {/* PROFILE SUMMARY */}
            <section
              style={{
                background: "#101828",
                color: "#ffffff",
                borderRadius: "18px",
                padding: "27px 30px",
                marginBottom: "22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                <div
                  style={{
                    width: "62px",
                    height: "62px",
                    borderRadius: "18px",
                    background: "#ffffff",
                    color: "#101828",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "25px",
                    fontWeight: "700",
                  }}
                >
                  {(profile.businessName || "V").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "10px",
                      letterSpacing: "1.4px",
                      opacity: 0.65,
                      fontWeight: "700",
                    }}
                  >
                    {profile.category || "SERVICE PROVIDER"}
                  </div>
                  <h2 style={{ margin: "5px 0 4px", fontSize: "23px" }}>
                    {profile.businessName}
                  </h2>
                  <p style={{ margin: 0, opacity: 0.7, fontSize: "13px" }}>
                    {profile.description || "Professional service provider"}
                  </p>
                </div>
              </div>

              <div
                style={{
                  padding: "10px 14px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "10px",
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                }}
              >
                {safeServices.length} active services
              </div>
            </section>

            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                    gap: "15px",
                    marginBottom: "22px",
                  }}
                >
                  <StatCard
                    label="SERVICES"
                    value={safeServices.length}
                    hint="Published services"
                  />
                  <StatCard
                    label="TOTAL BOOKINGS"
                    value={safeBookings.length}
                    hint="All customer bookings"
                  />
                  <StatCard
                    label="PENDING"
                    value={pendingBookings.length}
                    hint="Need your attention"
                  />
                  <StatCard
                    label="COMPLETED"
                    value={completedBookings.length}
                    hint="Successfully delivered"
                  />
                </div>

                <section
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e4e7ec",
                    borderRadius: "18px",
                    padding: "27px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <div>
                      <h2 style={{ margin: 0, fontSize: "20px" }}>
                        Recent bookings
                      </h2>
                      <p style={{ margin: "5px 0 0", color: "#667085", fontSize: "13px" }}>
                        Keep an eye on your latest customer requests.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("bookings")}
                      style={linkButtonStyle}
                    >
                      View all →
                    </button>
                  </div>

                  {safeBookings.length === 0 ? (
                    <div style={emptyBoxStyle}>
                      <strong>No bookings yet</strong>
                      <span>Customer bookings will appear here.</span>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: "10px" }}>
                      {safeBookings.slice(0, 4).map((booking) => (
                        <div
                          key={booking.id}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1.5fr 1fr auto",
                            alignItems: "center",
                            gap: "15px",
                            padding: "15px 17px",
                            border: "1px solid #eaecf0",
                            borderRadius: "12px",
                          }}
                        >
                          <div>
                            <div style={{ fontSize: "10px", color: "#98a2b3", letterSpacing: "0.8px", marginBottom: "5px" }}>
                              BOOKING #{booking.id}
                            </div>
                            <strong style={{ fontSize: "14px" }}>
                              {booking.serviceTitle || booking.service?.title || "Service"}
                            </strong>
                          </div>
                          <div style={{ color: "#667085", fontSize: "12px" }}>
                            {formatDate(booking.startTime)} · {formatTime(booking.startTime)}
                          </div>
                          <StatusPill status={booking.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}

            {/* SERVICES */}
            {activeTab === "services" && (
              <section
                style={{
                  background: "#ffffff",
                  border: "1px solid #e4e7ec",
                  borderRadius: "18px",
                  padding: "27px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "15px",
                    marginBottom: "22px",
                  }}
                >
                  <div>
                    <h2 style={{ margin: 0, fontSize: "22px" }}>My Services</h2>
                    <p style={{ margin: "5px 0 0", color: "#667085", fontSize: "13px" }}>
                      Manage the services customers can book from you.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowServiceForm(!showServiceForm)}
                    style={primaryButtonStyle}
                  >
                    {showServiceForm ? "Close" : "+ Add Service"}
                  </button>
                </div>

                {showServiceForm && (
                  <form
                    onSubmit={createService}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "13px",
                      padding: "20px",
                      background: "#f8fafc",
                      border: "1px solid #eaecf0",
                      borderRadius: "14px",
                      marginBottom: "22px",
                    }}
                  >
                    <input
                      placeholder="Service title"
                      value={serviceForm.title}
                      onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                      required
                      style={formInputStyle}
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Price (₹)"
                      value={serviceForm.price}
                      onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                      required
                      style={formInputStyle}
                    />
                    <textarea
                      placeholder="Service description"
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                      required
                      rows="3"
                      style={{ ...formInputStyle, gridColumn: "1 / -1" }}
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Duration in minutes"
                      value={serviceForm.durationMinutes}
                      onChange={(e) => setServiceForm({ ...serviceForm, durationMinutes: e.target.value })}
                      required
                      style={formInputStyle}
                    />
                    <button
                      type="submit"
                      disabled={saving}
                      style={primaryButtonStyle}
                    >
                      {saving ? "Creating..." : "Create Service"}
                    </button>
                  </form>
                )}

                <div style={{ marginBottom: "17px" }}>
                  <input
                    placeholder="Search your services..."
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    style={{
                      ...formInputStyle,
                      maxWidth: "360px",
                    }}
                  />
                </div>

                {filteredServices.length === 0 ? (
                  <div style={emptyBoxStyle}>
                    <strong>No services found</strong>
                    <span>Add a service or change your search.</span>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                      gap: "15px",
                    }}
                  >
                    {filteredServices.map((service) => (
                      <article
                        key={service.id}
                        style={{
                          border: "1px solid #e4e7ec",
                          borderRadius: "15px",
                          padding: "20px",
                        }}
                      >
                        <div
                          style={{
                            width: "38px",
                            height: "38px",
                            borderRadius: "11px",
                            background: "#f2f4f7",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "15px",
                          }}
                        >
                          ◆
                        </div>
                        <h3 style={{ margin: "0 0 8px", fontSize: "17px" }}>
                          {service.title}
                        </h3>
                        <p
                          style={{
                            margin: "0 0 18px",
                            color: "#667085",
                            fontSize: "13px",
                            lineHeight: "1.6",
                            minHeight: "42px",
                          }}
                        >
                          {service.description}
                        </p>
                        <div
                          style={{
                            borderTop: "1px solid #f2f4f7",
                            paddingTop: "14px",
                          }}
                        >
                          {editingService?.id === service.id ? (
                            <div style={{ display: "grid", gap: "10px" }}>
                              <input
                                style={formInputStyle}
                                value={editingService.title}
                                onChange={(e) =>
                                  setEditingService({ ...editingService, title: e.target.value })
                                }
                                placeholder="Service title"
                              />
                              <textarea
                                rows="3"
                                style={formInputStyle}
                                value={editingService.description}
                                onChange={(e) =>
                                  setEditingService({ ...editingService, description: e.target.value })
                                }
                                placeholder="Description"
                              />
                              <input
                                type="number"
                                min="1"
                                style={formInputStyle}
                                value={editingService.price}
                                onChange={(e) =>
                                  setEditingService({ ...editingService, price: e.target.value })
                                }
                                placeholder="Price"
                              />
                              <input
                                type="number"
                                min="1"
                                style={formInputStyle}
                                value={editingService.durationMinutes}
                                onChange={(e) =>
                                  setEditingService({ ...editingService, durationMinutes: e.target.value })
                                }
                                placeholder="Duration in minutes"
                              />
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                  type="button"
                                  onClick={() => editService(service.id)}
                                  disabled={saving}
                                  style={{ ...smallActionStyle, flex: 1, background: "#101828", color: "#ffffff", border: "none" }}
                                >
                                  {saving ? "Saving..." : "Save"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingService(null)}
                                  disabled={saving}
                                  style={{ ...smallDangerStyle, flex: 1 }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  marginBottom: "12px",
                                }}
                              >
                                <strong style={{ fontSize: "17px" }}>₹{service.price}</strong>
                                <span style={{ color: "#667085", fontSize: "12px" }}>
                                  {service.durationMinutes} min
                                </span>
                              </div>
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditingService({
                                      id: service.id,
                                      title: service.title || "",
                                      description: service.description || "",
                                      price: service.price ?? "",
                                      durationMinutes: service.durationMinutes ?? "",
                                    })
                                  }
                                  style={{ ...smallActionStyle, flex: 1, background: "#eef4ff", color: "#175cd3", border: "1px solid #b2ddff" }}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteService(service.id)}
                                  disabled={saving}
                                  style={{ ...smallDangerStyle, flex: 1, background: "#fef3f2", color: "#d92d20", border: "1px solid #fecaca" }}
                                >
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* BOOKINGS */}
            {activeTab === "bookings" && (
              <section
                style={{
                  background: "#ffffff",
                  border: "1px solid #e4e7ec",
                  borderRadius: "18px",
                  padding: "27px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    gap: "15px",
                    marginBottom: "22px",
                  }}
                >
                  <div>
                    <h2 style={{ margin: 0, fontSize: "22px" }}>Customer Bookings</h2>
                    <p style={{ margin: "5px 0 0", color: "#667085", fontSize: "13px" }}>
                      Review requests and update their status.
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setBookingFilter(filter)}
                        style={{
                          border: bookingFilter === filter ? "1px solid #101828" : "1px solid #d0d5dd",
                          background: bookingFilter === filter ? "#101828" : "#ffffff",
                          color: bookingFilter === filter ? "#ffffff" : "#667085",
                          borderRadius: "8px",
                          padding: "8px 10px",
                          fontSize: "10px",
                          fontWeight: "700",
                          cursor: "pointer",
                        }}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredBookings.length === 0 ? (
                  <div style={emptyBoxStyle}>
                    <strong>No bookings found</strong>
                    <span>There are no bookings matching this filter.</span>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "12px" }}>
                    {filteredBookings.map((booking) => (
                      <div
                        key={booking.id}
                        style={{
                          border: "1px solid #e4e7ec",
                          borderRadius: "14px",
                          padding: "19px",
                          display: "grid",
                          gridTemplateColumns: "1.4fr 1fr auto",
                          alignItems: "center",
                          gap: "18px",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "10px", color: "#98a2b3", letterSpacing: "0.8px", marginBottom: "6px" }}>
                            BOOKING #{booking.id}
                          </div>
                          <strong style={{ fontSize: "15px" }}>
                            {booking.serviceTitle || booking.service?.title || "Service"}
                          </strong>
                          <div style={{ marginTop: "6px", fontSize: "12px", color: "#667085" }}>
                            Customer ID #{booking.customerId || booking.customer?.id || "—"}
                          </div>
                        </div>

                        <div style={{ fontSize: "12px", color: "#667085" }}>
                          <strong style={{ display: "block", color: "#344054", marginBottom: "4px" }}>
                            {formatDate(booking.startTime)}
                          </strong>
                          {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "9px" }}>
                          <StatusPill status={booking.status} />
                          <div style={{ display: "flex", gap: "6px" }}>
                            {booking.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => updateBooking(booking.id, "CONFIRMED")}
                                  style={smallActionStyle}
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => updateBooking(booking.id, "CANCELLED")}
                                  style={smallDangerStyle}
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            {booking.status === "CONFIRMED" && (
                              <button
                                onClick={() => updateBooking(booking.id, "COMPLETED")}
                                style={smallActionStyle}
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* PROFILE */}
            {activeTab === "profile" && (
              <section
                style={{
                  background: "#ffffff",
                  border: "1px solid #e4e7ec",
                  borderRadius: "18px",
                  padding: "30px",
                  maxWidth: "850px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "18px", marginBottom: "28px" }}>
                  <div
                    style={{
                      width: "70px",
                      height: "70px",
                      borderRadius: "20px",
                      background: "#101828",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "27px",
                      fontWeight: "700",
                    }}
                  >
                    {(profile.businessName || "V").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "24px" }}>
                      {profile.businessName}
                    </h2>
                    <p style={{ margin: "5px 0 0", color: "#667085", fontSize: "13px" }}>
                      {profile.category || "Professional service provider"}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "24px",
                    borderTop: "1px solid #eaecf0",
                    paddingTop: "25px",
                  }}
                >
                  <div>
                    <div style={profileLabelStyle}>BUSINESS NAME</div>
                    <strong>{profile.businessName || "—"}</strong>
                  </div>
                  <div>
                    <div style={profileLabelStyle}>CATEGORY</div>
                    <strong>{profile.category || "—"}</strong>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <div style={profileLabelStyle}>DESCRIPTION</div>
                    <p style={{ margin: 0, color: "#475467", lineHeight: "1.7" }}>
                      {profile.description || "No description added."}
                    </p>
                  </div>
                  <div>
                    <div style={profileLabelStyle}>SERVICES</div>
                    <strong>{safeServices.length}</strong>
                  </div>
                  <div>
                    <div style={profileLabelStyle}>BOOKINGS</div>
                    <strong>{safeBookings.length}</strong>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <footer
        style={{
          borderTop: "1px solid #e4e7ec",
          background: "#ffffff",
          padding: "24px 6%",
          display: "flex",
          justifyContent: "space-between",
          color: "#98a2b3",
          fontSize: "12px",
        }}
      >
        <span>© 2026 ServiceHub</span>
        <span>Professional services, simplified.</span>
      </footer>
    </div>
  );
}

const formInputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #d0d5dd",
  borderRadius: "10px",
  padding: "12px 13px",
  fontSize: "13px",
  outline: "none",
  background: "#ffffff",
  color: "#101828",
};

const primaryButtonStyle = {
  border: "none",
  borderRadius: "10px",
  padding: "12px 17px",
  background: "#101828",
  color: "#ffffff",
  fontWeight: "600",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const linkButtonStyle = {
  border: "none",
  background: "transparent",
  color: "#344054",
  fontWeight: "600",
  cursor: "pointer",
};

const emptyBoxStyle = {
  background: "#f8fafc",
  borderRadius: "13px",
  padding: "40px 20px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "7px",
  color: "#667085",
  textAlign: "center",
};

const smallActionStyle = {
  border: "1px solid #d0d5dd",
  background: "#ffffff",
  color: "#344054",
  borderRadius: "8px",
  padding: "7px 10px",
  fontSize: "10px",
  fontWeight: "700",
  cursor: "pointer",
};

const smallDangerStyle = {
  ...smallActionStyle,
  color: "#c62828",
};

const profileLabelStyle = {
  fontSize: "10px",
  color: "#98a2b3",
  fontWeight: "700",
  letterSpacing: "0.8px",
  marginBottom: "7px",
};

/* =========================================================
   MAIN APP
========================================================= */

function App() {

  const [services, setServices] = useState([]);

  const [loadingServices, setLoadingServices] =
    useState(true);

  const [user, setUser] = useState(null);

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [showLogin, setShowLogin] =
    useState(false);

  const [showRegister, setShowRegister] =
    useState(false);

  const [showBooking, setShowBooking] =
    useState(false);

  const [selectedService, setSelectedService] =
    useState(null);

  const [bookings, setBookings] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("All");

  const [toastMessage, setToastMessage] =
    useState("");

  const [loginForm, setLoginForm] =
    useState({
      email: "",
      password: "",
    });

  const [registerForm, setRegisterForm] =
    useState({
      email: "",
      password: "",
      fullName: "",
      role: "ROLE_CUSTOMER",
    });

  const [bookingTime, setBookingTime] =
    useState("");

  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);


  /* =====================================================
     HANDLE EXPIRED AUTHENTICATION
  ===================================================== */

  useEffect(() => {
    const handleAuthExpired = () => {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      setBookings([]);
    };

    window.addEventListener("auth-expired", handleAuthExpired);

    return () => {
      window.removeEventListener("auth-expired", handleAuthExpired);
    };
  }, []);



  /* =====================================================
     TOAST
  ===================================================== */

  const toast = (message) => {

    setToastMessage(message);

    setTimeout(() => {
      setToastMessage("");
    }, 3000);

  };


  /* =====================================================
     LOAD SERVICES
  ===================================================== */

  const loadServices = async () => {

    try {

      setLoadingServices(true);

      const response = await api.get("/api/services");

      setServices(response.data);

    } catch (error) {

      console.error(
        "Unable to load services:",
        error
      );

      toast("Unable to load services");

    } finally {

      setLoadingServices(false);

    }

  };


  useEffect(() => {
    loadServices();
  }, []);



  /* =====================================================
     RESTORE LOGIN
  ===================================================== */

  useEffect(() => {

    if (!token) {
      return;
    }

    const restoreUser = async () => {

      try {

        const response = await api.get("/api/auth/me");

        setUser(response.data);

      } catch (error) {

        console.error(
          "Session expired:",
          error
        );

        localStorage.removeItem("token");
        setToken(null);
        setUser(null);

      }

    };

    restoreUser();

  }, [token]);



  /* =====================================================
     LOAD CUSTOMER BOOKINGS
  ===================================================== */

  const loadCustomerBookings = async () => {

    if (!token) {
      return;
    }

    try {

      const response = await api.get("/api/bookings/customer");

      setBookings(response.data);

    } catch (error) {

      console.error(
        "Booking loading error:",
        error
      );

    }

  };


  useEffect(() => {

    if (
      token &&
      user?.role === "ROLE_CUSTOMER"
    ) {
      loadCustomerBookings();
    }

  }, [token, user]);



  /* =====================================================
     LOGIN
  ===================================================== */

  const handleLogin = async (e) => {

    e.preventDefault();

    const email = loginForm.email.trim();
    const password = loginForm.password;

    if (!email || !password) {
      toast("Please enter your email and password.");
      return;
    }

    if (!isValidEmail(email)) {
      toast("Please enter a valid email address.");
      return;
    }

    setLoginLoading(true);

    try {

      const params = new URLSearchParams();
      params.append("email", email);
      params.append("password", password);

      const response = await api.post(
        `/api/auth/login?${params.toString()}`
      );

      const newToken = response.data;

      if (!newToken) {
        throw new Error("No token received from server");
      }

      localStorage.setItem("token", newToken);
      setToken(newToken);

      try {
        const userResponse = await api.get("/api/auth/me");
        setUser(userResponse.data);
        setShowLogin(false);
        setLoginForm({ email: "", password: "" });
        toast(`Welcome ${userResponse.data.fullName || "back"}!`);
      } catch (meError) {
        console.error("Login succeeded, but /api/auth/me failed:", meError);
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        toast("Login succeeded, but your user profile could not be loaded.");
      }

    } catch (error) {
      console.error("Login failed:", error);
      toast(
        error.response?.data?.message ||
        "Invalid email or password"
      );
    } finally {
      setLoginLoading(false);
    }
  };


  /* =====================================================
     REGISTER
  ===================================================== */

  const handleRegister = async (e) => {

    e.preventDefault();

    const fullName = registerForm.fullName.trim();
    const email = registerForm.email.trim();
    const password = registerForm.password;

    if (!fullName || !email || !password) {
      toast("Please fill in all required fields.");
      return;
    }

    if (fullName.length < 2) {
      toast("Full name must be at least 2 characters.");
      return;
    }

    if (!isValidEmail(email)) {
      toast("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      toast("Password must be at least 6 characters.");
      return;
    }

    setRegisterLoading(true);

    try {
      const params = new URLSearchParams();
      params.append("email", email);
      params.append("password", password);
      params.append("fullName", fullName);
      params.append("role", registerForm.role);

      await api.post(
        `/api/auth/register?${params.toString()}`
      );

      toast("Registration successful. Please login.");
      setShowRegister(false);
      setShowLogin(true);
      setRegisterForm({
        email: "",
        password: "",
        fullName: "",
        role: "ROLE_CUSTOMER",
      });

    } catch (error) {
      console.error("Registration error:", error);
      toast(
        error.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setRegisterLoading(false);
    }
  };


  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {

    localStorage.removeItem("token");

    setToken(null);
    setUser(null);
    setBookings([]);

    toast("Logged out successfully");

  };



  /* =====================================================
     BOOK SERVICE
  ===================================================== */

  const openBooking = (service) => {

    if (!user) {

      setShowLogin(true);

      toast(
        "Please login to book a service"
      );

      return;

    }


    if (user.role !== "ROLE_CUSTOMER") {

      toast(
        "Only customers can book services"
      );

      return;

    }


    setSelectedService(service);
    setShowBooking(true);

  };


  const createBooking = async (e) => {

    e.preventDefault();

    if (!selectedService) {
      return;
    }

    try {

      const params = new URLSearchParams();

      params.append(
        "serviceId",
        selectedService.id
      );

      params.append(
        "startTime",
        bookingTime
      );


      await api.post(
        `/api/bookings?${params.toString()}`
      );


      setShowBooking(false);
      setBookingTime("");

      toast(
        "Booking created successfully!"
      );

      await loadCustomerBookings();

    } catch (error) {

      console.error(
        "Booking error:",
        error
      );

      toast(
        error.response?.data?.message ||
        "Unable to create booking"
      );

    }

  };



  /* =====================================================
     FILTER SERVICES
  ===================================================== */

  const filteredServices = services.filter(
    (service) => {

      const matchesSearch =
        `${service.title || ""} ${
          service.description || ""
        }`
          .toLowerCase()
          .includes(search.toLowerCase());


      const serviceCategory =
        service.category ||
        "Professional";


      const matchesCategory =
        category === "All" ||
        serviceCategory === category;


      return (
        matchesSearch &&
        matchesCategory
      );

    }
  );


  const categories = [
    "All",
    ...new Set(
      services.map(
        (service) =>
          service.category ||
          "Professional"
      )
    ),
  ];



  /* =====================================================
     ADMIN
  ===================================================== */

  if (
    user?.role === "ROLE_ADMIN"
  ) {

    return (
      <>
        <AdminDashboard
          token={token}
          user={user}
          onLogout={handleLogout}
        />

        {toastMessage && (
          <div className="toast">
            {toastMessage}
          </div>
        )}
      </>
    );

  }



  /* =====================================================
     VENDOR
  ===================================================== */
  if (
    user?.role === "ROLE_VENDOR"
  ) {

    return (
      <>
        <VendorDashboard
          token={token}
          user={user}
          onLogout={handleLogout}
          toast={toast}
        />

        {toastMessage && (
          <div className="toast">
            {toastMessage}
          </div>
        )}
      </>
    );

  }



  /* =====================================================
     CUSTOMER DASHBOARD
  ===================================================== */

  if (
    user?.role === "ROLE_CUSTOMER"
  ) {

    return (
      <>
        <CustomerDashboard
          token={token}
          user={user}
          bookings={bookings}
          onRefresh={loadCustomerBookings}
          onLogout={handleLogout}
        />

        {toastMessage && (
          <div className="toast">
            {toastMessage}
          </div>
        )}
      </>
    );

  }



  /* =====================================================
     LANDING PAGE
  ===================================================== */

  return (
    <div className="app">

      {/* NAVBAR */}

      <nav className="navbar">

        <div className="nav-logo">

          <div className="brand-icon">
            S
          </div>

          <span>
            ServiceHub
          </span>

        </div>


        <div className="nav-links">

          <a href="#services">
            Services
          </a>

          <a href="#how">
            How it works
          </a>

        </div>


        <div className="nav-actions">

          <button
            className="nav-login"
            onClick={() =>
              setShowLogin(true)
            }
          >
            Log in
          </button>

          <button
            className="nav-signup"
            onClick={() =>
              setShowRegister(true)
            }
          >
            Get Started
          </button>

        </div>

      </nav>



      {/* HERO */}

      <section className="hero">

        <div className="hero-content">

          <span className="hero-kicker">
            THE SERVICE MARKETPLACE
          </span>

          <h1>
            Find the right
            <br />

            <span>
              service for you.
            </span>
          </h1>

          <p>
            Connect with trusted professionals,
            book services instantly, and manage
            everything from one simple platform.
          </p>


          <div className="hero-actions">

            <button
              className="primary-button"
              onClick={() =>
                document
                  .getElementById("services")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              Explore Services →
            </button>

            <button
              className="secondary-button"
              onClick={() =>
                setShowRegister(true)
              }
            >
              Become a Vendor
            </button>

          </div>

        </div>


        {/* HERO VISUAL */}

        <div className="hero-visual">

          <div className="hero-orbit"></div>

          <div className="floating-card card-one">

            <span>
              ✓
            </span>

            <div>

              <strong>
                Booking confirmed
              </strong>

              <small>
                Website Development
              </small>

            </div>

          </div>


          <div className="floating-card card-two">

            <small>
              Trusted professionals
            </small>

            <strong>
              4.9 / 5
            </strong>

          </div>


          <div className="hero-main-card">

            <div className="hero-card-top">

              <div className="hero-card-icon">
                ◆
              </div>

              <span>
                FEATURED
              </span>

            </div>

            <h3>
              Professional
              <br />
              Services
            </h3>

            <p>
              Quality services from verified
              professionals.
            </p>

            <div className="hero-card-line"></div>

            <div className="hero-card-bottom">

              <span>
                ServiceHub
              </span>

              <b>
                →
              </b>

            </div>

          </div>

        </div>

      </section>



      {/* SEARCH */}

      <section className="search-section">

        <div className="search-box">

          <span>
            ⌕
          </span>

          <input
            type="text"
            placeholder="What service are you looking for?"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <button>
            Search
          </button>

        </div>

      </section>



      {/* SERVICES */}

      <section
        className="services-section"
        id="services"
      >

        <div className="section-header">

          <div>

            <span className="section-kicker">
              EXPLORE
            </span>

            <h2>
              Popular services
            </h2>

          </div>

          <p>
            Find skilled professionals for
            whatever you need.
          </p>

        </div>


        {/* CATEGORY FILTER */}

        <div className="category-list">

          {categories.map((cat) => (

            <button
              key={cat}
              className={
                category === cat
                  ? "category active"
                  : "category"
              }
              onClick={() =>
                setCategory(cat)
              }
            >
              {cat}
            </button>

          ))}

        </div>


        {/* SERVICE CARDS */}

        {loadingServices ? (

          <div className="service-grid">

            {[1, 2, 3, 4].map(
              (item) => (

                <div
                  className="service-card skeleton-card"
                  key={item}
                >

                  <div className="skeleton"></div>

                  <div className="skeleton small"></div>

                  <div className="skeleton medium"></div>

                </div>

              )
            )}

          </div>

        ) : (

          <div className="service-grid">

            {filteredServices.map(
              (service) => (

                <article
                  className="service-card"
                  key={service.id}
                >

                  <div className="service-card-top">

                    <div className="service-icon">
                      ◆
                    </div>

                    <span>
                      {service.category ||
                        "Professional"}
                    </span>

                  </div>


                  <h3>
                    {service.title}
                  </h3>


                  <p>
                    {service.description}
                  </p>


                  <div className="service-card-footer">

                    <div>

                      <strong>
                        ₹{service.price}
                      </strong>

                      <small>
                        / {service.durationMinutes} min
                      </small>

                    </div>


                    <button
                      onClick={() =>
                        openBooking(service)
                      }
                    >
                      Book →
                    </button>

                  </div>

                </article>

              )
            )}

          </div>

        )}


        {!loadingServices &&
          filteredServices.length === 0 && (

            <div className="empty-state">

              <div className="empty-icon">
                ⌕
              </div>

              <h3>
                No services found
              </h3>

              <p>
                Try a different search or
                category.
              </p>

            </div>

          )}

      </section>



      {/* HOW IT WORKS */}

      <section
        className="how-section"
        id="how"
      >

        <div className="section-header center">

          <span className="section-kicker">
            SIMPLE PROCESS
          </span>

          <h2>
            How ServiceHub works
          </h2>

          <p>
            Everything you need in three simple
            steps.
          </p>

        </div>


        <div className="steps-grid">

          <div className="step-card">

            <span>
              01
            </span>

            <h3>
              Discover
            </h3>

            <p>
              Browse services from trusted
              professionals.
            </p>

          </div>


          <div className="step-card">

            <span>
              02
            </span>

            <h3>
              Book
            </h3>

            <p>
              Select a convenient time and
              confirm your booking.
            </p>

          </div>


          <div className="step-card">

            <span>
              03
            </span>

            <h3>
              Get it done
            </h3>

            <p>
              Connect with your professional
              and get the service completed.
            </p>

          </div>

        </div>

      </section>



      {/* CTA */}

      <section className="cta-section">

        <div>

          <span className="section-kicker">
            FOR PROFESSIONALS
          </span>

          <h2>
            Have a skill?
            <br />
            Turn it into a business.
          </h2>

          <p>
            Join ServiceHub and connect with
            customers looking for your expertise.
          </p>

          <button
            className="primary-button"
            onClick={() =>
              setShowRegister(true)
            }
          >
            Become a Vendor →
          </button>

        </div>

      </section>



      {/* FOOTER */}

      <footer className="footer">

        <div className="footer-brand">

          <div className="nav-logo">

            <div className="brand-icon">
              S
            </div>

            <span>
              ServiceHub
            </span>

          </div>

          <p>
            The simple marketplace for
            professional services.
          </p>

        </div>


        <div className="footer-links">

          <a href="#services">
            Services
          </a>

          <a href="#how">
            How it works
          </a>

          <button
            onClick={() =>
              setShowLogin(true)
            }
          >
            Login
          </button>

        </div>

      </footer>



      {/* LOGIN MODAL */}

      {showLogin && (

        <div
          className="modal-overlay"
          onClick={() =>
            setShowLogin(false)
          }
        >

          <div
            className="modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="modal-close"
              onClick={() =>
                setShowLogin(false)
              }
            >
              ×
            </button>

            <span className="section-kicker">
              WELCOME BACK
            </span>

            <h2>
              Login to ServiceHub
            </h2>

            <p>
              Access your dashboard and
              bookings.
            </p>


            <form onSubmit={handleLogin}>

              <input
                type="email"
                placeholder="Email address"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm({
                    ...loginForm,
                    email: e.target.value,
                  })
                }
                required
              />


              <input
                type="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({
                    ...loginForm,
                    password: e.target.value,
                  })
                }
                required
              />


              <button
                className="primary-button full"
                type="submit"
                disabled={loginLoading}
              >
                {loginLoading ? "Logging in..." : "Login →"}
              </button>

            </form>


            <div className="modal-switch">

              Don't have an account?

              <button
                onClick={() => {
                  setShowLogin(false);
                  setShowRegister(true);
                }}
              >
                Create one
              </button>

            </div>

          </div>

        </div>

      )}



      {/* REGISTER MODAL */}

      {showRegister && (

        <div
          className="modal-overlay"
          onClick={() =>
            setShowRegister(false)
          }
        >

          <div
            className="modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="modal-close"
              onClick={() =>
                setShowRegister(false)
              }
            >
              ×
            </button>

            <span className="section-kicker">
              JOIN SERVICEHUB
            </span>

            <h2>
              Create your account
            </h2>

            <p>
              Start using ServiceHub today.
            </p>


            <form onSubmit={handleRegister}>

              <input
                type="text"
                placeholder="Full name"
                value={registerForm.fullName}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    fullName: e.target.value,
                  })
                }
                required
              />


              <input
                type="email"
                placeholder="Email address"
                value={registerForm.email}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    email: e.target.value,
                  })
                }
                required
              />


              <input
                type="password"
                placeholder="Password"
                value={registerForm.password}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    password: e.target.value,
                  })
                }
                required
              />


              <select
                value={registerForm.role}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    role: e.target.value,
                  })
                }
              >

                <option value="ROLE_CUSTOMER">
                  Customer
                </option>

                <option value="ROLE_VENDOR">
                  Vendor
                </option>

              </select>


              <button
                className="primary-button full"
                type="submit"
                disabled={registerLoading}
              >
                {registerLoading ? "Creating account..." : "Create Account →"}
              </button>

            </form>


            <div className="modal-switch">

              Already have an account?

              <button
                onClick={() => {
                  setShowRegister(false);
                  setShowLogin(true);
                }}
              >
                Login
              </button>

            </div>

          </div>

        </div>

      )}



      {/* BOOKING MODAL */}

      {showBooking &&
        selectedService && (

          <div
            className="modal-overlay"
            onClick={() =>
              setShowBooking(false)
            }
          >

            <div
              className="modal booking-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <button
                className="modal-close"
                onClick={() =>
                  setShowBooking(false)
                }
              >
                ×
              </button>

              <span className="section-kicker">
                BOOK SERVICE
              </span>

              <h2>
                {selectedService.title}
              </h2>

              <p>
                Choose when you'd like the
                service.
              </p>


              <div className="selected-service-summary">

                <strong>
                  ₹{selectedService.price}
                </strong>

                <span>
                  {selectedService.durationMinutes}
                  {" "}
                  minutes
                </span>

              </div>


              <form
                onSubmit={createBooking}
              >

                <label>
                  Start date & time
                </label>

                <input
                  type="datetime-local"
                  value={bookingTime}
                  onChange={(e) =>
                    setBookingTime(
                      e.target.value
                    )
                  }
                  required
                />


                <button
                  className="primary-button full"
                  type="submit"
                >
                  Confirm Booking →
                </button>

              </form>

            </div>

          </div>

        )}



      {/* TOAST */}

      {toastMessage && (

        <div className="toast">
          {toastMessage}
        </div>

      )}

    </div>
  );
}

export default App;

