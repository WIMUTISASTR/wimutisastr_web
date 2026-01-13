"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import PageContainer from "@/compounents/PageContainer";
import Button from "@/compounents/Button";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    membershipType: "Free",
    joinDate: "",
    documentsViewed: 0,
    videosWatched: 0,
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  // Fetch user data from Supabase
  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
          // Get user metadata
          const fullName = user.user_metadata?.full_name || "";
          const phone = user.user_metadata?.phone || "";
          const email = user.email || "";
          
          // Get join date from created_at
          const joinDate = user.created_at 
            ? new Date(user.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
              })
            : "";

          // Check payment status
          const paymentData = localStorage.getItem('payment_status');
          const hasPaid = paymentData ? JSON.parse(paymentData).paid === true : false;
          const membershipType = hasPaid ? "Premium" : "Free";

          // TODO: Fetch actual documents viewed and videos watched from Supabase
          // For now, using placeholder values
          const documentsViewed = 0;
          const videosWatched = 0;

          setUserData({
            name: fullName || email.split("@")[0],
            email: email,
            phone: phone,
            membershipType: membershipType,
            joinDate: joinDate,
            documentsViewed: documentsViewed,
            videosWatched: videosWatched,
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Failed to load profile data");
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }
  }, [user]);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const checkAndAnimate = () => {
      const animatedElements = document.querySelectorAll(
        '.opacity-0[class*="delay"], .opacity-0.translate-y-8, .opacity-0.translate-y-4, .opacity-0.translate-x-8, .opacity-0.-translate-x-8'
      );
      animatedElements.forEach((el) => {
        observer.observe(el);
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          setTimeout(() => {
            el.classList.add("animate-in");
          }, 50);
        }
      });
    };

    checkAndAnimate();
    setTimeout(checkAndAnimate, 100);

    return () => observer.disconnect();
  }, []);

  const handleSave = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Update user metadata in Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: userData.name,
          phone: userData.phone,
        },
      });

      if (updateError) {
        toast.error(updateError.message || "Failed to update profile");
        setLoading(false);
        return;
      }

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <PageContainer>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brown)] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <PageContainer>
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white py-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/asset/aboutUs.png"
            alt="Profile background"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-900/60 to-slate-900/70 z-10"></div>
        {/* Subtle gold accent overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--brown-soft)] to-transparent z-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 opacity-0 translate-y-8 delay-100">
              My Profile
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto opacity-0 translate-y-8 delay-300">
              Manage your account settings and preferences
            </p>
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Sidebar - Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-24 opacity-0 translate-y-8 delay-100">
                <div className="text-center">
                  {/* Avatar */}
                  <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-[var(--brown)]/25">
                    <div className="w-full h-full bg-[var(--brown-soft)] flex items-center justify-center">
                      <span className="text-4xl font-bold text-[var(--brown-strong)]">
                        {userData.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {userData.name}
                  </h2>
                  <p className="text-gray-600 mb-4">{userData.email}</p>
                  
                  {/* Membership Badge */}
                  <div className="inline-flex items-center px-4 py-2 bg-[var(--brown-soft)] text-[var(--brown-strong)] rounded-full font-semibold mb-6">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {userData.membershipType} Member
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-2xl font-bold text-gray-900">{userData.documentsViewed}</p>
                      <p className="text-sm text-gray-600">Documents</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-2xl font-bold text-gray-900">{userData.videosWatched}</p>
                      <p className="text-sm text-gray-600">Videos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Personal Information */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 opacity-0 translate-y-8 delay-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="primary"
                      className="px-4 py-2 text-base"
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="space-x-3">
                      <Button
                        onClick={() => setIsEditing(false)}
                        variant="outline"
                        className="px-4 py-2 text-base"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        variant="primary"
                        className="px-4 py-2 text-base"
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={userData.name}
                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brown)]"
                      />
                    ) : (
                      <p className="text-gray-900">{userData.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <p className="text-gray-900">{userData.email}</p>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={userData.phone}
                        onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brown)]"
                      />
                    ) : (
                      <p className="text-gray-900">{userData.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Member Since
                    </label>
                    <p className="text-gray-900">{userData.joinDate}</p>
                  </div>
                </div>
              </div>
              {/* Activity History */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 opacity-0 translate-y-8 delay-400">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 border-b border-gray-200">
                    <div className="w-12 h-12 bg-[var(--brown-soft)] rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-[var(--brown-strong)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Viewed: Cambodian Labor Law</p>
                      <p className="text-sm text-gray-600">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 border-b border-gray-200">
                    <div className="w-12 h-12 bg-[var(--brown-soft)] rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-[var(--brown-strong)]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Watched: Introduction to Corporate Law</p>
                      <p className="text-sm text-gray-600">5 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4">
                    <div className="w-12 h-12 bg-[var(--brown-soft)] rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-[var(--brown-strong)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Viewed: Land Law in Cambodia</p>
                      <p className="text-sm text-gray-600">1 week ago</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Settings */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 opacity-0 translate-y-8 delay-500">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <div>
                      <p className="font-semibold text-gray-900">Sign Out</p>
                      <p className="text-sm text-gray-600">Sign out of your account</p>
                    </div>
                    <Button 
                      onClick={async () => {
                        await signOut();
                        toast.success("Signed out successfully");
                      }}
                      variant="outline"
                      className="px-4 py-2 text-base"
                    >
                      Sign Out
                    </Button>
                  </div>
                  <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <div>
                      <p className="font-semibold text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive updates via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--brown)]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--brown)]"></div>
                    </label>
                  </div>
                  <div className="flex justify-between items-center p-4">
                    <div>
                      <p className="font-semibold text-red-600">Delete Account</p>
                      <p className="text-sm text-gray-600">Permanently delete your account</p>
                    </div>
                    <Button 
                      variant="outline"
                      className="px-4 py-2 text-base border-red-300 text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}

