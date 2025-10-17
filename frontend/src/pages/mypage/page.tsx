import { useAuth } from "@/context/AuthContext";
import { useApiClient } from "@/lib/backend/apiClient";
import type { components } from "@/lib/backend/apiV1/schema";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Badge from "../../components/base/Badge";
import Button from "../../components/base/Button";
import Card from "../../components/base/Card";
import Input from "../../components/base/Input";
import Select from "../../components/base/Select";

type EvaluationResponse = components["schemas"]["EvaluationResponse"];
type ApplicationSummaryDto = components["schemas"]["ApplicationSummaryDto"];
type ProjectSummaryDto = components["schemas"]["ProjectSummaryDto"];

import { mockFeedback } from "@/mocks/users";
import MyPageSocial from "./social/page";

interface BaseProfile {
  username: string;
  name: string;
  role: "CLIENT" | "FREELANCER";
  createdAt: string;
  ratingAvg: number;
  email: string;
  profileScope?: "PUBLIC" | "PRIVATE";
  // 공통 제공 필드 (백엔드 ProfileResponseDto 기준)
  skills?: string[];
  interests?: string[];
}

interface FreelancerProfile extends BaseProfile {
  role: "FREELANCER";
  job: string;
  career: { [key: string]: number };
  freelancerEmail: string;
  comment: string;
}

interface ClientProfile extends BaseProfile {
  role: "CLIENT";
  companyName: string;
  companySize: "STARTUP" | "SMALL" | "MEDIUM" | "LARGE";
  companyDescription: string;
  representative: string;
  businessNo: string;
  companyPhone: string;
  companyEmail: string;
}

type ExtendedProfileResponse = FreelancerProfile | ClientProfile;

// 내가 지원한 프로젝트 응답 아이템 타입 (스키마 사용)
type MyApplicationItem = ApplicationSummaryDto;

// 내가 등록한 프로젝트 응답 아이템 타입 (스키마 사용)
type MyProjectItem = ProjectSummaryDto & { freelancerId?: number };

// 평가 응답 타입 (스키마 사용)
type EvaluationItem = EvaluationResponse;

interface MyPageProps {
  userType?: "client" | "freelancer";
}

export default function MyPage({ userType = "client" }: MyPageProps) {
  const client = useApiClient();
  const navigate = useNavigate();
  const { isLoggedIn, user, token } = useAuth();
  //새로고침해도 탭 상태 유지
  const [activeTab, setActiveTab] = useState<
    "profile" | "projects" | "bookmarks" | "feedback" | "mefeedback" | "social"
  >(() => (localStorage.getItem("activeTab") as any) || "profile");

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  const defaultFreelancerProfile: FreelancerProfile = {
    username: "",
    name: "",
    role: "FREELANCER",
    createdAt: "",
    ratingAvg: 0,
    email: "",
    profileScope: "PUBLIC",
    skills: [],
    interests: [],
    job: "",
    career: {},
    freelancerEmail: "",
    comment: "",
  };

  const defaultClientProfile: ClientProfile = {
    username: "",
    name: "",
    role: "CLIENT",
    createdAt: "",
    ratingAvg: 0,
    email: "",
    profileScope: "PUBLIC",
    companyName: "",
    companySize: "STARTUP",
    companyDescription: "",
    representative: "",
    businessNo: "",
    companyPhone: "",
    companyEmail: "",
  };

  const [profileData, setProfileData] = useState<ExtendedProfileResponse>(
    userType === "freelancer" ? defaultFreelancerProfile : defaultClientProfile
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // skills 편집 상태
  const [allSkills, setAllSkills] = useState<{ id: number; name: string }[]>(
    []
  );
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);
  // projects 탭 필터 상태
  const [projectStatusFilter, setProjectStatusFilter] = useState<
    "all" | "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CLOSED"
  >("all");
  const [applicationStatusFilter, setApplicationStatusFilter] = useState<
    "all" | "WAIT" | "ACCEPT" | "DENIED"
  >("all");
  // Projects tab: search/sort/pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKeyClient, setSortKeyClient] = useState<
    "date" | "price" | "title"
  >("date");
  const [sortDirClient, setSortDirClient] = useState<"asc" | "desc">("desc");
  const [sortKeyFreelancer, setSortKeyFreelancer] = useState<
    "date" | "pay" | "title"
  >("date");
  const [sortDirFreelancer, setSortDirFreelancer] = useState<"asc" | "desc">(
    "desc"
  );
  const [pageClient, setPageClient] = useState(1);
  const [pageSizeClient, setPageSizeClient] = useState(5);
  const [pageFreelancer, setPageFreelancer] = useState(1);
  const [pageSizeFreelancer, setPageSizeFreelancer] = useState(5);

  // applications/projects for profile tab
  const [applications, setApplications] = useState<MyApplicationItem[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [projects, setProjects] = useState<MyProjectItem[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  // profile-tab paginations removed; lists live in Projects tab

  // evaluations for feedback tab
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [evaluationsLoading, setEvaluationsLoading] = useState(false);
  const [evaluationsError, setEvaluationsError] = useState<string | null>(null);

  // written evaluations for mefeedback tab
  const [writtenEvaluations, setWrittenEvaluations] = useState<
    EvaluationItem[]
  >([]);
  const [writtenEvaluationsLoading, setWrittenEvaluationsLoading] =
    useState(false);
  const [writtenEvaluationsError, setWrittenEvaluationsError] = useState<
    string | null
  >(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 로그인 체크 및 리다이렉트
  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 페이지입니다.");
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  // 프리랜서만: 내가 지원한 프로젝트 목록 조회
  useEffect(() => {
    const fetchMyApplications = async () => {
      if (!isLoggedIn) return;
      if (profileData.role !== "FREELANCER") return;

      try {
        setAppsLoading(true);
        const accessToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("accessToken="))
          ?.split("=")[1];

        const { data, error } = await client.GET(
          "/api/v1/members/me/applications",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (error) {
          const code = (error as any)?.data?.resultCode;
          if (code === "401-1") {
            navigate("/login");
            return;
          }
          if (code?.startsWith("400-")) {
            console.warn("지원 목록 400 응답 처리:", (error as any)?.data?.msg);
            setApplications([]);
            return;
          }
          console.error("지원 목록 조회 에러:", error);
          setApplications([]);
          return;
        }

        if (!data) {
          console.error("지원 목록 데이터가 없습니다.");
          setApplications([]);
          return;
        }

        if ((data as any)?.resultCode === "401-1") {
          navigate("/login");
          return;
        }

        if (Array.isArray(data.data)) {
          // API 응답 데이터를 MyApplicationItem 타입에 맞게 변환
          const transformedData: MyApplicationItem[] = data.data.map(
            (item: any) => ({
              id: item.id || 0,
              estimatedPay: item.estimatedPay || 0,
              expectedDuration: item.expectedDuration || "",
              workPlan: item.workPlan || "",
              additionalRequest: item.additionalRequest || "",
              status: item.status || "WAIT",
              createDate: item.createDate || new Date().toISOString(),
              projectId: item.projectId || 0,
              projectTitle: item.projectTitle || "",
              freelancerId: item.freelancerId || 0,
              freelancerName: item.freelancerName || "",
            })
          );
          setApplications(transformedData);
        } else {
          console.warn("지원 목록 응답 포맷이 예상과 다릅니다:", data);
          setApplications([]);
        }
      } catch (err) {
        console.error("지원 목록 조회 실패:", err);
        setApplications([]);
      } finally {
        setAppsLoading(false);
      }
    };

    fetchMyApplications();
  }, [isLoggedIn, profileData.role, navigate]);

  // 스킬 전체 목록 로드
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const { data, error } = await client.GET("/api/v1/skills");
        if (error) {
          console.warn("스킬 목록 조회 에러:", error);
          return;
        }
        if (data && Array.isArray((data as any).data)) {
          const list = ((data as any).data as any[])
            .map((s) => ({ id: s.id as number, name: s.name as string }))
            .filter((s) => s.id != null && s.name);
          setAllSkills(list);
        }
      } catch (e) {
        console.warn("스킬 목록 조회 실패:", e);
      }
    };
    fetchSkills();
  }, []);

  // pagination removed from profile tab

  // Page correction for client projects list
  useEffect(() => {
    if ((profileData as any)?.role !== "CLIENT") return;
    const filtered =
      projectStatusFilter === "all"
        ? projects
        : projects.filter((p) => p.status === projectStatusFilter);
    const q = searchQuery.trim().toLowerCase();
    const searched = q
      ? filtered.filter(
          (p) =>
            p.title?.toLowerCase().includes(q) ||
            p.summary?.toLowerCase().includes(q)
        )
      : filtered;
    const totalPages = Math.max(1, Math.ceil(searched.length / pageSizeClient));
    if (pageClient > totalPages) setPageClient(totalPages);
  }, [
    projects,
    projectStatusFilter,
    searchQuery,
    pageSizeClient,
    pageClient,
    (profileData as any)?.role,
  ]);

  // Page correction for freelancer applications list
  useEffect(() => {
    if ((profileData as any)?.role !== "FREELANCER") return;
    const filtered =
      applicationStatusFilter === "all"
        ? applications
        : applications.filter((a) => a.status === applicationStatusFilter);
    const q = searchQuery.trim().toLowerCase();
    const searched = q
      ? filtered.filter((a) => a.projectTitle?.toLowerCase().includes(q))
      : filtered;
    const totalPages = Math.max(
      1,
      Math.ceil(searched.length / pageSizeFreelancer)
    );
    if (pageFreelancer > totalPages) setPageFreelancer(totalPages);
  }, [
    applications,
    applicationStatusFilter,
    searchQuery,
    pageSizeFreelancer,
    pageFreelancer,
    (profileData as any)?.role,
  ]);

  // 클라이언트만: 내가 등록한 프로젝트 목록 조회
  useEffect(() => {
    const fetchMyProjects = async () => {
      if (!isLoggedIn) return;
      if (profileData.role !== "CLIENT") return;
      try {
        setProjectsLoading(true);
        const accessToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("accessToken="))
          ?.split("=")[1];

        const { data, error } = await client.GET(
          "/api/v1/members/me/projects",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (error) {
          const code = (error as any)?.data?.resultCode;
          if (code === "401-1") {
            navigate("/login");
            return;
          }
          if (code === "400-1") {
            console.warn(
              "프로젝트 목록 400 응답 처리:",
              (error as any)?.data?.msg
            );
            setProjects([]);
            return;
          }
          console.error("프로젝트 목록 조회 에러:", error);
          setProjects([]);
          return;
        }
        if (!data) throw new Error("프로젝트 목록 데이터가 없습니다.");

        if (data.resultCode === "200-9" && Array.isArray(data.data)) {
          setProjects(data.data as MyProjectItem[]);
        } else if (data.resultCode === "401-1") {
          navigate("/login");
        } else if (data.resultCode === "400-1") {
          console.warn("프로젝트 목록 400 응답 처리:", data.msg);
          setProjects([]);
        } else {
          console.warn("프로젝트 목록 응답 포맷이 예상과 다릅니다:", data);
          setProjects([]);
        }
      } catch (err) {
        console.error("프로젝트 목록 조회 실패:", err);
        setProjects([]);
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchMyProjects();
  }, [isLoggedIn, profileData.role, navigate]);

  // 프로필 조회
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const accessToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("accessToken="))
          ?.split("=")[1];

        const { data, error } = await client.GET("/api/v1/members/me", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error("프로필 데이터가 없습니다.");
        }

        if (data.resultCode === "200-7") {
          const responseData = data.data;
          // 타입 안전성을 위해 명시적으로 변환
          const transformedProfile = {
            ...profileData,
            ...responseData,
            // 명시적으로 기본값 보정
            skills: (responseData as any)?.skills || [],
            interests: (responseData as any)?.interests || [],
            profileScope: (responseData as any)?.profileScope || "PUBLIC",
            ...(responseData.role === "CLIENT"
              ? {
                  companyName:
                    (responseData as any).companyName ||
                    responseData.name ||
                    "",
                  companySize: (responseData as any).companySize || "STARTUP",
                  companyDescription:
                    (responseData as any).companyDescription || "",
                  representative: (responseData as any).representative || "",
                  businessNo: (responseData as any).businessNo || "",
                  companyPhone: (responseData as any).companyPhone || "",
                  companyEmail: (responseData as any).companyEmail || "",
                }
              : {
                  job: (responseData as any).job || "",
                  career: (responseData as any).career || {},
                  freelancerEmail:
                    (responseData as any).freelancerEmail ||
                    responseData.email ||
                    "",
                  comment: (responseData as any).comment || "",
                }),
          } as ExtendedProfileResponse;
          setProfileData(transformedProfile);
        } else {
          throw new Error("프로필 조회에 실패했습니다.");
        }
      } catch (error: any) {
        if (error?.data?.resultCode === "401-1") {
          navigate("/login");
        } else {
          alert("프로필 조회에 실패했습니다. 잠시 후 다시 시도해주세요.");
        }
      } finally {
        // no-op
      }
    };

    if (isLoggedIn) {
      fetchProfile();
    }
  }, [isLoggedIn, navigate]);

  // 프로필 skills(이름) -> selectedSkillIds(아이디) 초기 동기화
  useEffect(() => {
    if (
      profileData.role === "FREELANCER" &&
      Array.isArray(profileData.skills) &&
      allSkills.length > 0
    ) {
      const mapped = profileData.skills
        .map((name) => allSkills.find((s) => s.name === name)?.id)
        .filter((id): id is number => typeof id === "number");
      setSelectedSkillIds(mapped);
    }
  }, [profileData.role, profileData.skills, allSkills]);

  const tabs =
    profileData.role === "CLIENT"
      ? [
          { id: "profile", label: "프로필 관리", icon: "ri-user-3-line" },
          {
            id: "projects",
            label: "등록 프로젝트",
            icon: "ri-briefcase-4-line",
          },
          { id: "bookmarks", label: "관심 프리랜서", icon: "ri-heart-3-line" },
          { id: "feedback", label: "피드백 관리", icon: "ri-star-line" },
          {
            id: "mefeedback",
            label: "내가 등록한 피드백",
            icon: "ri-star-line",
          },
          //OAuth : 소셜 계정 연결 확인용 화면 제공
          { id: "social", label: "소셜 계정 연결", icon: "ri-links-line" },
        ]
      : [
          { id: "profile", label: "프로필 관리", icon: "ri-user-3-line" },
          {
            id: "projects",
            label: "지원 프로젝트",
            icon: "ri-briefcase-4-line",
          },
          { id: "bookmarks", label: "관심 프로젝트", icon: "ri-heart-3-line" },
          { id: "feedback", label: "피드백 관리", icon: "ri-star-line" },
          {
            id: "mefeedback",
            label: "내가 등록한 피드백",
            icon: "ri-star-line",
          },
          //OAuth : 소셜 계정 연결 확인용 화면 제공
          { id: "social", label: "소셜 계정 연결", icon: "ri-links-line" },
        ];

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updateData =
        profileData.role === "CLIENT"
          ? {
              name:
                (profileData as ClientProfile).companyName ||
                profileData.name ||
                "",
              profileScope: profileData.profileScope || "PUBLIC",
              companyName:
                (profileData as ClientProfile).companyName ||
                profileData.name ||
                "",
              companySize:
                (profileData as ClientProfile).companySize || "STARTUP",
              companyDescription:
                (profileData as ClientProfile).companyDescription || "",
              representative:
                (profileData as ClientProfile).representative || "",
              businessNo: (profileData as ClientProfile).businessNo || "",
              companyPhone: (profileData as ClientProfile).companyPhone || "",
              companyEmail: (profileData as ClientProfile).companyEmail || "",
              email: profileData.email || "",
            }
          : {
              name: profileData.name || "",
              profileScope: profileData.profileScope || "PUBLIC",
              job: (profileData as FreelancerProfile).job || "",
              freelancerEmail:
                (profileData as FreelancerProfile).freelancerEmail || "",
              comment: (profileData as FreelancerProfile).comment || "",
              career: (profileData as FreelancerProfile).career || {},
              // skills 편집: 선택된 스킬 아이디 전송
              skillIds: selectedSkillIds,
            };

      const accessToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("accessToken="))
        ?.split("=")[1];
      let ok = false;
      if (profileData.role === "FREELANCER") {
        // 프리랜서: PUT /api/v1/freelancers/{id}
        const freelancerId = user?.id;
        if (!freelancerId)
          throw new Error("사용자 ID를 찾을 수 없습니다. 다시 로그인해주세요.");
        const { data, error } = await client.PUT("/api/v1/freelancers/{id}", {
          params: { path: { id: freelancerId } },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: {
            job: (updateData as any).job,
            freelancerEmail: (updateData as any).freelancerEmail,
            comment: (updateData as any).comment,
            career: (updateData as any).career,
            skillIds: (updateData as any).skillIds,
          },
        });
        if (error || !data) throw error || new Error("프리랜서 정보 수정 실패");
        // ApiV1FreelancerController는 resultCode "200"
        ok = data.resultCode === "200";
      } else {
        // 클라이언트: 기존 me/profile PATCH 유지
        const { data, error } = await client.PATCH(
          "/api/v1/members/me/profile",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: updateData,
          }
        );
        if (error || !data)
          throw error || new Error("프로필 수정에 실패했습니다.");
        ok = data.resultCode === "200-8";
      }

      if (ok) {
        alert("프로필이 성공적으로 업데이트되었습니다!");
      } else {
        alert(
          "프로필 수정 응답을 확인하지 못했습니다. 잠시 후 다시 시도해주세요."
        );
      }
    } catch (error: any) {
      if (error?.data?.resultCode === "401-1") {
        alert("로그인이 필요한 서비스입니다.");
        navigate("/login");
      } else {
        alert(error?.message || "프로필 수정에 실패했습니다.");
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 프로젝트 즐겨찾기/북마크 용 데이터는 아래에서 직접 사용합니다.

  // 북마크된 프리랜서/프로젝트 (임시 데이터)
  // 관심 항목 이전 목데이터 사용 제거 (API 연동으로 대체)

  // Bookmarks (연동)
  const [favFreelancers, setFavFreelancers] = useState<any[]>([]);
  const [favSearch, setFavSearch] = useState("");
  const [favSortKey, setFavSortKey] = useState<"rating" | "name">("rating");
  const [favSortDir, setFavSortDir] = useState<"asc" | "desc">("desc");
  const [favPage, setFavPage] = useState(1);
  const [favPageSize, setFavPageSize] = useState(5);
  const [favLoading, setFavLoading] = useState(false);
  const [favError, setFavError] = useState<string | null>(null);

  // 관심 프리랜서 상세 (지연 로딩/캐시)
  const [favFreelancerDetailOpen, setFavFreelancerDetailOpen] = useState<
    Record<number, boolean>
  >({});
  const [favFreelancerDetail, setFavFreelancerDetail] = useState<
    Record<number, any>
  >({});
  const [favFreelancerDetailLoading, setFavFreelancerDetailLoading] = useState<
    Record<number, boolean>
  >({});
  const [favFreelancerDetailError, setFavFreelancerDetailError] = useState<
    Record<number, string | null>
  >({});

  const toggleFavFreelancerDetail = async (memberId: number) => {
    setFavFreelancerDetailOpen((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));
    const willOpen = !favFreelancerDetailOpen[memberId];
    if (!willOpen) return; // 닫는 경우는 로드 안 함
    if (favFreelancerDetail[memberId]) return; // 이미 로드됨
    if (!token) return;
    try {
      setFavFreelancerDetailLoading((prev) => ({ ...prev, [memberId]: true }));
      setFavFreelancerDetailError((prev) => ({ ...prev, [memberId]: null }));
      const { data, error } = await client.GET(
        "/api/v1/members/{userId}/profile",
        {
          params: { path: { userId: memberId } },
          headers: { Authorization: `Bearer ${token}` },
        } as any
      );
      if (error) throw error as any;
      const prof = (data as any)?.data || {};
      setFavFreelancerDetail((prev) => ({ ...prev, [memberId]: prof }));
    } catch (e: any) {
      const msg = e?.data?.msg || e?.message || "프로필 조회 실패";
      setFavFreelancerDetailError((prev) => ({ ...prev, [memberId]: msg }));
    } finally {
      setFavFreelancerDetailLoading((prev) => ({ ...prev, [memberId]: false }));
    }
  };

  // 관심 프리랜서 목록 조회
  useEffect(() => {
    let cancelled = false;
    const fetchFavorites = async () => {
      if (!token) return;
      setFavLoading(true);
      setFavError(null);
      try {
        const { data, error } = await client.GET(
          "/api/v1/members/me/favorites/freelancers",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (error) {
          const code = (error as any)?.data?.resultCode;
          if (code === "401-1") {
            navigate("/login");
            return;
          }
          setFavError((error as any)?.data?.msg || "관심 프리랜서 조회 실패");
          setFavFreelancers([]);
          return;
        }

        const list = ((data as any)?.data || []).map((f: any) => ({
          id: f.id, // freelancerId
          memberId: f.memberId,
          name: f.name,
          profileImgUrl: f.profileImgUrl,
          job: f.job,
          experience: f.job || "", // 기존 UI 호환
          averageRating: f.ratingAvg ?? 0,
          skills: [], // API에 없으므로 비움
        }));
        if (!cancelled) setFavFreelancers(list);
      } catch (e: any) {
        if (!cancelled) setFavError(e?.message || "관심 프리랜서 조회 중 오류");
      } finally {
        if (!cancelled) setFavLoading(false);
      }
    };
    fetchFavorites();
    return () => {
      cancelled = true;
    };
  }, [token]);

  // 페이지 보정: 검색/데이터/페이지크기 변경 시 현재 페이지가 총 페이지를 넘지 않도록 보정
  useEffect(() => {
    const q = favSearch.trim().toLowerCase();
    const searched = q
      ? favFreelancers.filter(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            (f.experience || "").toLowerCase().includes(q)
        )
      : favFreelancers;
    const totalPages = Math.max(1, Math.ceil(searched.length / favPageSize));
    if (favPage > totalPages) setFavPage(totalPages);
  }, [favFreelancers, favSearch, favPageSize]);

  const removeBookmark = async (id: number, type: "freelancer" | "project") => {
    if (!token) return;
    if (type === "freelancer") {
      // id는 freelancer의 memberId
      const prev = favFreelancers;
      setFavFreelancers((p) => p.filter((f: any) => f.memberId !== id));
      try {
        const { error } = await client.DELETE(
          `/api/v1/members/me/favorites/freelancers/{userId}`,
          {
            params: { path: { userId: id } },
            headers: { Authorization: `Bearer ${token}` },
          } as any
        );
        if (error) throw error;
      } catch (e: any) {
        // 롤백
        setFavFreelancers(prev);
        alert(e?.data?.msg || "북마크 해제 실패");
      }
    } else {
      const prev = favProjects;
      setFavProjects((p) => p.filter((pr: any) => pr.id !== id));
      try {
        const { error } = await client.DELETE(
          `/api/v1/members/me/favorites/projects/{projectId}`,
          {
            params: { path: { projectId: id } },
            headers: { Authorization: `Bearer ${token}` },
          } as any
        );
        if (error) throw error;
      } catch (e: any) {
        setFavProjects(prev);
        alert(e?.data?.msg || "프로젝트 북마크 해제 실패");
      }
    }
  };

  // 관심 프로젝트 목록 조회 (프리랜서)
  const [favProjects, setFavProjects] = useState<any[]>([]);
  const [favProjLoading, setFavProjLoading] = useState(false);
  const [favProjError, setFavProjError] = useState<string | null>(null);
  const [favProjSearch, setFavProjSearch] = useState("");
  const [favProjSortKey, setFavProjSortKey] = useState<
    "deadline" | "budget" | "title"
  >("deadline");
  const [favProjSortDir, setFavProjSortDir] = useState<"asc" | "desc">("desc");
  const [favProjPage, setFavProjPage] = useState(1);
  const [favProjPageSize, setFavProjPageSize] = useState(5);

  useEffect(() => {
    let cancelled = false;
    const fetchEvaluations = async () => {
      if (!token) return;
      setEvaluationsLoading(true);
      setEvaluationsError(null);
      try {
        const { data, error } = await client.GET("/api/v1/evaluations/me");
        if (error) {
          console.error("평가 조회 에러:", error);
          setEvaluationsError("평가를 불러오는데 실패했습니다.");
          return;
        }
        if (data?.data) {
          const evaluations = data.data.evaluations || [];
          // API 응답의 optional 필드들을 처리하여 타입 안전성 확보
          const processedEvaluations: EvaluationItem[] = evaluations.map(
            (evaluationItem: any) => ({
              evaluationId: evaluationItem.evaluationId || 0,
              projectId: evaluationItem.projectId || 0,
              evaluatorId: evaluationItem.evaluatorId || 0,
              evaluateeId: evaluationItem.evaluateeId || 0,
              comment: evaluationItem.comment || "",
              ratingSatisfaction: evaluationItem.ratingSatisfaction || 0,
              ratingProfessionalism: evaluationItem.ratingProfessionalism || 0,
              ratingScheduleAdherence:
                evaluationItem.ratingScheduleAdherence || 0,
              ratingCommunication: evaluationItem.ratingCommunication || 0,
              ratingProactiveness: evaluationItem.ratingProactiveness || 0,
              createdAt: evaluationItem.createdAt || new Date().toISOString(),
            })
          );
          setEvaluations(processedEvaluations);
        }
      } catch (err) {
        console.error("평가 조회 중 오류:", err);
        setEvaluationsError("평가를 불러오는데 실패했습니다.");
      } finally {
        setEvaluationsLoading(false);
      }
    };

    const fetchWrittenEvaluations = async () => {
      if (!token) return;
      setWrittenEvaluationsLoading(true);
      setWrittenEvaluationsError(null);
      try {
        const { data, error } = await client.GET(
          "/api/v1/evaluations/written-by-me"
        );
        if (error) {
          console.error("작성한 평가 조회 에러:", error);
          setWrittenEvaluationsError("작성한 평가를 불러오는데 실패했습니다.");
          return;
        }
        if (data?.data) {
          const evaluations = data.data.evaluations || [];
          // API 응답의 optional 필드들을 처리하여 타입 안전성 확보
          const processedEvaluations: EvaluationItem[] = evaluations.map(
            (evaluationItem: any) => ({
              evaluationId: evaluationItem.evaluationId || 0,
              projectId: evaluationItem.projectId || 0,
              evaluatorId: evaluationItem.evaluatorId || 0,
              evaluateeId: evaluationItem.evaluateeId || 0,
              comment: evaluationItem.comment || "",
              ratingSatisfaction: evaluationItem.ratingSatisfaction || 0,
              ratingProfessionalism: evaluationItem.ratingProfessionalism || 0,
              ratingScheduleAdherence:
                evaluationItem.ratingScheduleAdherence || 0,
              ratingCommunication: evaluationItem.ratingCommunication || 0,
              ratingProactiveness: evaluationItem.ratingProactiveness || 0,
              createdAt: evaluationItem.createdAt || new Date().toISOString(),
            })
          );
          setWrittenEvaluations(processedEvaluations);
        }
      } catch (err) {
        console.error("작성한 평가 조회 중 오류:", err);
        setWrittenEvaluationsError("작성한 평가를 불러오는데 실패했습니다.");
      } finally {
        setWrittenEvaluationsLoading(false);
      }
    };

    const fetchFavProjects = async () => {
      if (!token) return;
      setFavProjLoading(true);
      setFavProjError(null);
      try {
        const { data, error } = await client.GET(
          "/api/v1/members/me/favorites/projects",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (error) {
          const code = (error as any)?.data?.resultCode;
          if (code === "401-1") {
            navigate("/login");
            return;
          }
          setFavProjError(
            (error as any)?.data?.msg || "관심 프로젝트 조회 실패"
          );
          setFavProjects([]);
          return;
        }
        const list = ((data as any)?.data || []).map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.summary ?? "",
          clientName: p.ownerName ?? "",
          status: p.status ?? "",
          budget: p.price ?? 0,
          duration: p.duration ?? "",
          deadline: p.deadline ?? "",
          skills: (p.skills || []).map(
            (s: any) => s.name as string
          ) as string[],
        }));
        if (!cancelled) setFavProjects(list);
      } catch (e: any) {
        if (!cancelled)
          setFavProjError(e?.message || "관심 프로젝트 조회 중 오류");
      } finally {
        if (!cancelled) setFavProjLoading(false);
      }
    };
    fetchEvaluations();
    fetchWrittenEvaluations();
    fetchFavProjects();
    return () => {
      cancelled = true;
    };
  }, [token]);

  // 프로젝트 북마크 페이지 보정
  useEffect(() => {
    const q = favProjSearch.trim().toLowerCase();
    const searched = q
      ? favProjects.filter(
          (p) =>
            p.title?.toLowerCase().includes(q) ||
            (p.description || "").toLowerCase().includes(q)
        )
      : favProjects;
    const totalPages = Math.max(
      1,
      Math.ceil(searched.length / favProjPageSize)
    );
    if (favProjPage > totalPages) setFavProjPage(totalPages);
  }, [favProjects, favProjSearch, favProjPageSize]);

  // 프로젝트 통계

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Profile"
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-xl"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                  {profileData.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {profileData.name}
              </h1>
              <div className="flex items-center space-x-4">
                <p className="text-lg text-gray-600 flex items-center">
                  <i className="ri-briefcase-line mr-2"></i>
                  {userType === "client" ? "클라이언트" : "프리랜서"}
                </p>
                {/* 평균 평점 표시 제거 */}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* 사이드바 */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sticky top-8">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-[1.02]"
                        : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                    }`}
                  >
                    <i className={`${tab.icon} mr-3 text-lg`}></i>
                    {tab.label}
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="space-y-3">
                  <Link to="/auth/change-password">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full rounded-xl"
                    >
                      <i className="ri-lock-password-line mr-2"></i>
                      비밀번호 변경
                    </Button>
                  </Link>
                  <Link to="/auth/delete-account">
                    <Button
                      variant="danger"
                      size="sm"
                      className="w-full rounded-xl"
                    >
                      <i className="ri-delete-bin-line mr-2"></i>
                      계정 탈퇴
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              {/* 프로필 관리 */}
              {activeTab === "profile" && (
                <>
                  <div className="p-8">
                    <div className="flex items-center space-x-3 mb-8">
                      <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                        <i className="ri-user-3-line text-white text-xl"></i>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          프로필 관리
                        </h2>
                        <p className="text-gray-600">계정 정보를 관리하세요</p>
                      </div>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-8">
                      {/* 프로필 사진 업로드 */}
                      <div className="text-center">
                        <div className="relative inline-block">
                          {selectedImage ? (
                            <img
                              src={selectedImage}
                              alt="Profile"
                              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                            />
                          ) : (
                            <div className="w-32 h-32 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                              {profileData.name.charAt(0)}
                            </div>
                          )}
                          <label className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors shadow-lg border-2 border-indigo-100">
                            <i className="ri-camera-line text-indigo-600 text-lg"></i>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleImageUpload}
                            />
                          </label>
                        </div>
                        <p className="text-sm text-gray-500 mt-3">
                          프로필 사진을 업로드하세요
                        </p>
                        {profileData.createdAt && (
                          <p className="text-xs text-gray-400 mt-1">
                            등록일:{" "}
                            {new Date(profileData.createdAt).toLocaleDateString(
                              "ko-KR"
                            )}
                          </p>
                        )}
                      </div>

                      {/* 프로필 공개 범위 설정 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                          label="프로필 공개 범위"
                          value={profileData.profileScope || "PUBLIC"}
                          onChange={handleSelectChange("profileScope")}
                          options={[
                            { label: "공개", value: "PUBLIC" },
                            { label: "비공개", value: "PRIVATE" },
                          ]}
                        />
                      </div>

                      {profileData.role === "CLIENT" ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                              label="회사명"
                              name="companyName"
                              value={
                                (profileData as ClientProfile).companyName || ""
                              }
                              onChange={handleInputChange}
                              className="rounded-xl"
                            />
                            <Select
                              label="회사 규모"
                              value={
                                (profileData as ClientProfile).companySize || ""
                              }
                              onChange={handleSelectChange("companySize")}
                              options={[
                                { label: "스타트업", value: "STARTUP" },
                                { label: "중소기업", value: "SMALL" },
                                { label: "중견기업", value: "MEDIUM" },
                                { label: "대기업", value: "LARGE" },
                              ]}
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-6">
                            <Input
                              label="개인 이메일"
                              type="email"
                              name="email"
                              placeholder="개인 연락용 이메일을 입력하세요"
                              value={profileData.email || ""}
                              onChange={handleInputChange}
                              className="rounded-xl"
                            />
                          </div>

                          {/* (선택) 기술 스택 표시 */}
                          {Array.isArray(profileData.skills) &&
                            profileData.skills.length > 0 && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  기술 스택
                                </label>
                                <div className="flex flex-wrap gap-2">
                                  {profileData.skills.map((skill, idx) => (
                                    <span
                                      key={`${skill}-${idx}`}
                                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              회사 소개
                            </label>
                            <textarea
                              name="companyDescription"
                              rows={4}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                              value={
                                (profileData as ClientProfile)
                                  .companyDescription || ""
                              }
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                              label="연락처"
                              name="companyPhone"
                              value={
                                (profileData as ClientProfile).companyPhone ||
                                ""
                              }
                              onChange={handleInputChange}
                              className="rounded-xl"
                            />
                            <Input
                              label="회사 이메일"
                              type="email"
                              name="companyEmail"
                              placeholder="회사 업무용 이메일을 입력하세요"
                              value={
                                (profileData as ClientProfile).companyEmail ||
                                ""
                              }
                              onChange={handleInputChange}
                              className="rounded-xl"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                              label="대표자명"
                              name="representative"
                              value={
                                (profileData as ClientProfile).representative ||
                                ""
                              }
                              onChange={handleInputChange}
                              className="rounded-xl"
                            />
                            <Input
                              label="사업자등록번호"
                              name="businessNo"
                              value={
                                (profileData as ClientProfile).businessNo || ""
                              }
                              onChange={handleInputChange}
                              className="rounded-xl"
                            />
                          </div>

                          {/* 내 프로젝트 목록은 '프로젝트 관리' 탭에서 확인하세요. */}
                        </>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                              label="이름"
                              name="name"
                              value={profileData.name}
                              onChange={handleInputChange}
                              className="rounded-xl"
                            />
                            <Input
                              label="개인 이메일"
                              type="email"
                              name="email"
                              placeholder="개인 연락용 이메일을 입력하세요"
                              value={profileData.email || ""}
                              onChange={handleInputChange}
                              className="rounded-xl"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              직무
                            </label>
                            <Input
                              name="job"
                              value={
                                (profileData as FreelancerProfile).job || ""
                              }
                              onChange={handleInputChange}
                              placeholder="예: 백엔드 개발자"
                              className="rounded-xl"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              경력
                            </label>
                            <div className="grid grid-cols-1 gap-4">
                              {Object.entries(
                                (profileData as FreelancerProfile).career || {}
                              ).map(([skill, months]) => (
                                <div
                                  key={skill}
                                  className="flex items-center gap-4"
                                >
                                  <Input
                                    name={`skill-${skill}`}
                                    value={skill}
                                    onChange={(e) => {
                                      const newCareer = {
                                        ...(profileData as FreelancerProfile)
                                          .career,
                                      };
                                      delete newCareer[skill];
                                      newCareer[e.target.value] =
                                        months as number;
                                      setProfileData(
                                        (prev) =>
                                          ({
                                            ...prev,
                                            career: newCareer,
                                          } as FreelancerProfile)
                                      );
                                    }}
                                    placeholder="기술명"
                                    className="rounded-xl flex-1"
                                  />
                                  <Input
                                    name={`months-${skill}`}
                                    type="number"
                                    value={String(months)}
                                    onChange={(e) => {
                                      setProfileData(
                                        (prev) =>
                                          ({
                                            ...prev,
                                            career: {
                                              ...(prev as FreelancerProfile)
                                                .career,
                                              [skill]:
                                                parseInt(e.target.value) || 0,
                                            },
                                          } as FreelancerProfile)
                                      );
                                    }}
                                    placeholder="개월 수"
                                    className="rounded-xl w-32"
                                  />
                                </div>
                              ))}
                              <Button
                                type="button"
                                onClick={() => {
                                  setProfileData(
                                    (prev) =>
                                      ({
                                        ...prev,
                                        career: {
                                          ...(prev as FreelancerProfile).career,
                                          "": 0,
                                        },
                                      } as FreelancerProfile)
                                  );
                                }}
                                className="mt-2"
                              >
                                + 경력 추가
                              </Button>
                            </div>
                          </div>

                          {/* 기술 스택 (편집) */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              기술 스택
                            </label>
                            <div className="space-y-3">
                              {/* 선택된 스킬 표시 */}
                              <div>
                                <div className="text-xs text-gray-600 mb-1">
                                  선택된 스킬: {selectedSkillIds.length}개
                                </div>
                                {selectedSkillIds.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {allSkills
                                      .filter((s) =>
                                        selectedSkillIds.includes(s.id)
                                      )
                                      .map((s) => (
                                        <span
                                          key={`sel-${s.id}`}
                                          className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs cursor-pointer"
                                          onClick={() =>
                                            setSelectedSkillIds((prev) =>
                                              prev.filter((id) => id !== s.id)
                                            )
                                          }
                                          title="클릭하여 제거"
                                        >
                                          {s.name}
                                          <i className="ri-close-line"></i>
                                        </span>
                                      ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500">
                                    아직 선택된 스킬이 없습니다.
                                  </p>
                                )}
                              </div>

                              {/* 전체 스킬 토글 목록 */}
                              <div className="flex flex-wrap gap-2 max-h-52 overflow-auto border border-gray-200 rounded-xl p-3">
                                {allSkills.length > 0 ? (
                                  allSkills.map((skill) => {
                                    const active = selectedSkillIds.includes(
                                      skill.id
                                    );
                                    return (
                                      <button
                                        type="button"
                                        key={skill.id}
                                        onClick={() =>
                                          setSelectedSkillIds((prev) =>
                                            prev.includes(skill.id)
                                              ? prev.filter(
                                                  (id) => id !== skill.id
                                                )
                                              : [...prev, skill.id]
                                          )
                                        }
                                        className={`px-2 py-1 rounded text-xs border transition-colors ${
                                          active
                                            ? "bg-indigo-600 text-white border-indigo-600"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                        }`}
                                      >
                                        {skill.name}
                                      </button>
                                    );
                                  })
                                ) : (
                                  <div className="text-sm text-gray-500">
                                    스킬 목록을 불러오는 중이거나, 스킬이
                                    없습니다.
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                업무용 이메일
                              </label>
                              <Input
                                name="freelancerEmail"
                                type="email"
                                value={
                                  (profileData as FreelancerProfile)
                                    .freelancerEmail || ""
                                }
                                onChange={handleInputChange}
                                placeholder="업무 연락용 이메일을 입력하세요"
                                className="rounded-xl"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                한줄 소개
                              </label>
                              <textarea
                                name="comment"
                                rows={2}
                                placeholder="간단한 자기소개를 작성해주세요"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                value={
                                  (profileData as FreelancerProfile).comment ||
                                  ""
                                }
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>

                          {/* 내 지원 현황은 '프로젝트 관리' 탭에서 확인하세요. */}
                        </>
                      )}

                      <div className="flex justify-end space-x-4 pt-8">
                        <Button
                          variant="outline"
                          type="button"
                          className="rounded-xl"
                        >
                          취소
                        </Button>
                        <Button
                          type="submit"
                          className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600"
                        >
                          저장
                        </Button>
                      </div>
                    </form>
                  </div>
                </>
              )}

              {/* 프로젝트 관리 */}
              {activeTab === "projects" && (
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                      <i className="ri-briefcase-4-line text-white text-xl"></i>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {profileData.role === "CLIENT"
                          ? "프로젝트 관리"
                          : "지원 현황"}
                      </h2>
                      <p className="text-gray-600">
                        {profileData.role === "CLIENT"
                          ? "내가 등록한 프로젝트를 확인하고 상태별로 살펴보세요."
                          : "내가 지원한 프로젝트를 상태별로 확인해보세요."}
                      </p>
                    </div>
                  </div>

                  {profileData.role === "CLIENT" ? (
                    <>
                      {/* 상태 필터 */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {[
                          { key: "all", label: "전체" },
                          { key: "OPEN", label: "모집중" },
                          { key: "IN_PROGRESS", label: "진행중" },
                          { key: "COMPLETED", label: "완료" },
                          { key: "CLOSED", label: "마감" },
                        ].map(({ key, label }) => (
                          <Button
                            key={key}
                            type="button"
                            variant={
                              projectStatusFilter === (key as any)
                                ? "primary"
                                : "outline"
                            }
                            size="sm"
                            className="rounded-xl"
                            onClick={() => setProjectStatusFilter(key as any)}
                          >
                            {label}
                          </Button>
                        ))}
                      </div>

                      {/* 검색/정렬/페이지 크기 */}
                      <div className="flex flex-wrap items-end gap-3 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            검색
                          </label>
                          <Input
                            name="search"
                            placeholder="제목/요약 검색"
                            value={searchQuery}
                            onChange={(e) => {
                              setSearchQuery(e.target.value);
                              setPageClient(1);
                            }}
                            className="rounded-xl w-56"
                          />
                        </div>
                        <div className="w-44">
                          <Select
                            label="정렬"
                            value={`${sortKeyClient}:${sortDirClient}`}
                            onChange={(val) => {
                              const [k, d] = (val as string).split(":") as [
                                typeof sortKeyClient,
                                typeof sortDirClient
                              ];
                              setSortKeyClient(k);
                              setSortDirClient(d);
                            }}
                            options={[
                              { label: "최신순", value: "date:desc" },
                              { label: "오래된순", value: "date:asc" },
                              { label: "가격높은순", value: "price:desc" },
                              { label: "가격낮은순", value: "price:asc" },
                              { label: "제목 오름차순", value: "title:asc" },
                              { label: "제목 내림차순", value: "title:desc" },
                            ]}
                          />
                        </div>
                        <div className="w-40">
                          <Select
                            label="페이지 크기"
                            value={String(pageSizeClient)}
                            onChange={(val) => {
                              setPageSizeClient(parseInt(val));
                              setPageClient(1);
                            }}
                            options={[
                              { label: "5개", value: "5" },
                              { label: "10개", value: "10" },
                              { label: "20개", value: "20" },
                            ]}
                          />
                        </div>
                      </div>

                      {/* 목록 */}
                      {projectsLoading ? (
                        <div className="text-sm text-gray-500">
                          불러오는 중...
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {(() => {
                            const filtered =
                              projectStatusFilter === "all"
                                ? projects
                                : projects.filter(
                                    (p) => p.status === projectStatusFilter
                                  );
                            const q = searchQuery.trim().toLowerCase();
                            const searched = q
                              ? filtered.filter(
                                  (p) =>
                                    p.title?.toLowerCase().includes(q) ||
                                    p.summary?.toLowerCase().includes(q)
                                )
                              : filtered;
                            const sorted = [...searched].sort((a, b) => {
                              const dir = sortDirClient === "asc" ? 1 : -1;
                              if (sortKeyClient === "date")
                                return (
                                  (new Date(a.createDate || 0).getTime() -
                                    new Date(b.createDate || 0).getTime()) *
                                  dir
                                );
                              if (sortKeyClient === "price")
                                return ((a.price || 0) - (b.price || 0)) * dir;
                              return (
                                (a.title || "").localeCompare(b.title || "") *
                                dir
                              );
                            });
                            const start = (pageClient - 1) * pageSizeClient;
                            return sorted.slice(start, start + pageSizeClient);
                          })().map((p) => (
                            <Card key={p.id} className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <Link
                                      to={`/projects/${p.id}`}
                                      className="text-base font-semibold text-gray-900 hover:underline truncate"
                                    >
                                      {p.title}
                                    </Link>
                                    <Badge
                                      variant={
                                        p.status === "OPEN"
                                          ? "success"
                                          : p.status === "IN_PROGRESS"
                                          ? "warning"
                                          : p.status === "COMPLETED"
                                          ? "primary"
                                          : "secondary"
                                      }
                                      size="sm"
                                    >
                                      {p.status === "OPEN"
                                        ? "모집중"
                                        : p.status === "IN_PROGRESS"
                                        ? "진행중"
                                        : p.status === "COMPLETED"
                                        ? "완료"
                                        : "마감"}
                                    </Badge>
                                  </div>
                                  <div className="mt-1 text-sm text-gray-600 line-clamp-2">
                                    {p.summary}
                                  </div>
                                  <div className="mt-1 text-sm text-gray-600">
                                    예산:{" "}
                                    {new Intl.NumberFormat("ko-KR", {
                                      style: "currency",
                                      currency: "KRW",
                                      maximumFractionDigits: 0,
                                    }).format(p.price || 0)}{" "}
                                    · 기간: {p.duration} · 마감: {p.deadline}
                                  </div>
                                  <div className="mt-1 text-xs text-gray-500">
                                    스킬:{" "}
                                    {p.skills?.map((s) => s.name).join(", ") ||
                                      "-"}
                                  </div>
                                  <div className="mt-0.5 text-xs text-gray-500">
                                    관심사:{" "}
                                    {p.interests
                                      ?.map((i) => i.name)
                                      .join(", ") || "-"}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 whitespace-nowrap">
                                  <div className="text-xs text-gray-500">
                                    {new Intl.DateTimeFormat("ko-KR", {
                                      year: "numeric",
                                      month: "2-digit",
                                      day: "2-digit",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }).format(new Date(p.createDate || 0))}
                                  </div>
                                  <Link to={`/projects/${p.id}`}>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="rounded-xl"
                                    >
                                      지원서 목록
                                    </Button>
                                  </Link>
                                  {p.status === "COMPLETED" && (
                                    <Link
                                      to={`/evaluation/freelancer/${p.id}`}
                                      state={{ evaluateeId: p.freelancerId }}
                                    >
                                      <Button
                                        size="sm"
                                        variant="primary"
                                        className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600"
                                      >
                                        <i className="ri-star-line mr-1"></i>
                                        평가하기
                                      </Button>
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                          {(projectStatusFilter === "all"
                            ? projects
                            : projects.filter(
                                (p) => p.status === projectStatusFilter
                              )
                          ).length === 0 && (
                            <div className="text-sm text-gray-500">
                              표시할 프로젝트가 없습니다.
                            </div>
                          )}
                          {/* pagination controls */}
                          <div className="flex items-center justify-center gap-3 pt-2">
                            <Button
                              type="button"
                              variant="outline"
                              disabled={pageClient <= 1}
                              onClick={() =>
                                setPageClient((prev) => Math.max(1, prev - 1))
                              }
                              className="rounded-xl"
                            >
                              이전
                            </Button>
                            <span className="text-sm text-gray-600">
                              {(() => {
                                const filtered =
                                  projectStatusFilter === "all"
                                    ? projects
                                    : projects.filter(
                                        (p) => p.status === projectStatusFilter
                                      );
                                const q = searchQuery.trim().toLowerCase();
                                const searched = q
                                  ? filtered.filter(
                                      (p) =>
                                        p.title?.toLowerCase().includes(q) ||
                                        p.summary?.toLowerCase().includes(q)
                                    )
                                  : filtered;
                                const totalPages = Math.max(
                                  1,
                                  Math.ceil(searched.length / pageSizeClient)
                                );
                                return `${pageClient} / ${totalPages}`;
                              })()}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const filtered =
                                  projectStatusFilter === "all"
                                    ? projects
                                    : projects.filter(
                                        (p) => p.status === projectStatusFilter
                                      );
                                const q = searchQuery.trim().toLowerCase();
                                const searched = q
                                  ? filtered.filter(
                                      (p) =>
                                        p.title?.toLowerCase().includes(q) ||
                                        p.summary?.toLowerCase().includes(q)
                                    )
                                  : filtered;
                                const totalPages = Math.max(
                                  1,
                                  Math.ceil(searched.length / pageSizeClient)
                                );
                                setPageClient((prev) =>
                                  Math.min(totalPages, prev + 1)
                                );
                              }}
                              className="rounded-xl"
                            >
                              다음
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    // 프리랜서 지원 현황
                    <>
                      {/* 상태 필터 */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {[
                          { key: "all", label: "전체" },
                          { key: "WAIT", label: "대기중" },
                          { key: "ACCEPT", label: "승인됨" },
                          { key: "DENIED", label: "거절됨" },
                        ].map(({ key, label }) => (
                          <Button
                            key={key}
                            type="button"
                            variant={
                              applicationStatusFilter === (key as any)
                                ? "primary"
                                : "outline"
                            }
                            size="sm"
                            className="rounded-xl"
                            onClick={() =>
                              setApplicationStatusFilter(key as any)
                            }
                          >
                            {label}
                          </Button>
                        ))}
                      </div>

                      {/* 검색/정렬/페이지 크기 */}
                      <div className="flex flex-wrap items-end gap-3 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            검색
                          </label>
                          <Input
                            name="search"
                            placeholder="프로젝트 제목 검색"
                            value={searchQuery}
                            onChange={(e) => {
                              setSearchQuery(e.target.value);
                              setPageFreelancer(1);
                            }}
                            className="rounded-xl w-56"
                          />
                        </div>
                        <div className="w-44">
                          <Select
                            label="정렬"
                            value={`${sortKeyFreelancer}:${sortDirFreelancer}`}
                            onChange={(val) => {
                              const [k, d] = (val as string).split(":") as [
                                typeof sortKeyFreelancer,
                                typeof sortDirFreelancer
                              ];
                              setSortKeyFreelancer(k);
                              setSortDirFreelancer(d);
                            }}
                            options={[
                              { label: "최신순", value: "date:desc" },
                              { label: "오래된순", value: "date:asc" },
                              { label: "금액높은순", value: "pay:desc" },
                              { label: "금액낮은순", value: "pay:asc" },
                              { label: "제목 오름차순", value: "title:asc" },
                              { label: "제목 내림차순", value: "title:desc" },
                            ]}
                          />
                        </div>
                        <div className="w-40">
                          <Select
                            label="페이지 크기"
                            value={String(pageSizeFreelancer)}
                            onChange={(val) => {
                              setPageSizeFreelancer(parseInt(val));
                              setPageFreelancer(1);
                            }}
                            options={[
                              { label: "5개", value: "5" },
                              { label: "10개", value: "10" },
                              { label: "20개", value: "20" },
                            ]}
                          />
                        </div>
                      </div>

                      {/* 목록 */}
                      {appsLoading ? (
                        <div className="text-sm text-gray-500">
                          불러오는 중...
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {(() => {
                            const filtered =
                              applicationStatusFilter === "all"
                                ? applications
                                : applications.filter(
                                    (a) => a.status === applicationStatusFilter
                                  );
                            const q = searchQuery.trim().toLowerCase();
                            const searched = q
                              ? filtered.filter((a) =>
                                  a.projectTitle?.toLowerCase().includes(q)
                                )
                              : filtered;
                            const sorted = [...searched].sort((a, b) => {
                              const dir = sortDirFreelancer === "asc" ? 1 : -1;
                              if (sortKeyFreelancer === "date")
                                return (
                                  (new Date(a.createDate || 0).getTime() -
                                    new Date(b.createDate || 0).getTime()) *
                                  dir
                                );
                              if (sortKeyFreelancer === "pay")
                                return (
                                  ((a.estimatedPay || 0) -
                                    (b.estimatedPay || 0)) *
                                  dir
                                );
                              return (
                                (a.projectTitle || "").localeCompare(
                                  b.projectTitle || ""
                                ) * dir
                              );
                            });
                            const start =
                              (pageFreelancer - 1) * pageSizeFreelancer;
                            return sorted.slice(
                              start,
                              start + pageSizeFreelancer
                            );
                          })().map((app) => (
                            <Card key={app.id} className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <Link
                                      to={`/projects/${app.projectId}`}
                                      className="text-base font-semibold text-gray-900 hover:underline"
                                    >
                                      {app.projectTitle}
                                    </Link>
                                    <Badge
                                      variant={
                                        app.status === "WAIT"
                                          ? "warning"
                                          : app.status === "ACCEPT"
                                          ? "success"
                                          : "danger"
                                      }
                                      size="sm"
                                    >
                                      {app.status}
                                    </Badge>
                                  </div>
                                  <div className="mt-1 text-sm text-gray-600">
                                    예상 급여:{" "}
                                    {new Intl.NumberFormat("ko-KR", {
                                      style: "currency",
                                      currency: "KRW",
                                      maximumFractionDigits: 0,
                                    }).format(app.estimatedPay || 0)}
                                  </div>
                                  <div className="mt-0.5 text-sm text-gray-600">
                                    예상 기간: {app.expectedDuration}
                                  </div>
                                  <div className="mt-0.5 text-sm text-gray-600">
                                    근무 계획: {app.workPlan}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-xs text-gray-500 whitespace-nowrap">
                                    {new Intl.DateTimeFormat("ko-KR", {
                                      year: "numeric",
                                      month: "2-digit",
                                      day: "2-digit",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }).format(new Date(app.createDate || 0))}
                                  </div>
                                  <Link
                                    to={`/projects/${app.projectId}/apply/${app.id}`}
                                  >
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="rounded-xl"
                                    >
                                      지원서 보기
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </Card>
                          ))}
                          {(applicationStatusFilter === "all"
                            ? applications
                            : applications.filter(
                                (a) => a.status === applicationStatusFilter
                              )
                          ).length === 0 && (
                            <div className="text-sm text-gray-500">
                              표시할 지원 내역이 없습니다.
                            </div>
                          )}
                          {/* pagination controls */}
                          <div className="flex items-center justify-center gap-3 pt-2">
                            <Button
                              type="button"
                              variant="outline"
                              disabled={pageFreelancer <= 1}
                              onClick={() =>
                                setPageFreelancer((prev) =>
                                  Math.max(1, prev - 1)
                                )
                              }
                              className="rounded-xl"
                            >
                              이전
                            </Button>
                            <span className="text-sm text-gray-600">
                              {(() => {
                                const filtered =
                                  applicationStatusFilter === "all"
                                    ? applications
                                    : applications.filter(
                                        (a) =>
                                          a.status === applicationStatusFilter
                                      );
                                const q = searchQuery.trim().toLowerCase();
                                const searched = q
                                  ? filtered.filter((a) =>
                                      a.projectTitle?.toLowerCase().includes(q)
                                    )
                                  : filtered;
                                const totalPages = Math.max(
                                  1,
                                  Math.ceil(
                                    searched.length / pageSizeFreelancer
                                  )
                                );
                                return `${pageFreelancer} / ${totalPages}`;
                              })()}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const filtered =
                                  applicationStatusFilter === "all"
                                    ? applications
                                    : applications.filter(
                                        (a) =>
                                          a.status === applicationStatusFilter
                                      );
                                const q = searchQuery.trim().toLowerCase();
                                const searched = q
                                  ? filtered.filter((a) =>
                                      a.projectTitle?.toLowerCase().includes(q)
                                    )
                                  : filtered;
                                const totalPages = Math.max(
                                  1,
                                  Math.ceil(
                                    searched.length / pageSizeFreelancer
                                  )
                                );
                                setPageFreelancer((prev) =>
                                  Math.min(totalPages, prev + 1)
                                );
                              }}
                              className="rounded-xl"
                            >
                              다음
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* 북마크 관리 */}
              {activeTab === "bookmarks" && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    {profileData.role === "CLIENT"
                      ? "관심 프리랜서"
                      : "관심 프로젝트"}
                  </h2>

                  {profileData.role === "CLIENT" ? (
                    // 클라이언트 - 관심 프리랜서
                    <div className="space-y-4">
                      {/* 검색/정렬/페이지 크기 */}
                      <div className="flex flex-wrap items-end gap-3 mb-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            검색
                          </label>
                          <Input
                            name="favSearch"
                            placeholder="이름/경력 검색"
                            value={favSearch}
                            onChange={(e) => {
                              setFavSearch(e.target.value);
                              setFavPage(1);
                            }}
                            className="rounded-xl w-56"
                          />
                        </div>
                        <div className="w-44">
                          <Select
                            label="정렬"
                            value={`${favSortKey}:${favSortDir}`}
                            onChange={(val) => {
                              const [k, d] = (val as string).split(":") as [
                                typeof favSortKey,
                                typeof favSortDir
                              ];
                              setFavSortKey(k);
                              setFavSortDir(d);
                            }}
                            options={[
                              { label: "평점 높은순", value: "rating:desc" },
                              { label: "평점 낮은순", value: "rating:asc" },
                              { label: "이름 오름차순", value: "name:asc" },
                              { label: "이름 내림차순", value: "name:desc" },
                            ]}
                          />
                        </div>
                        <div className="w-40">
                          <Select
                            label="페이지 크기"
                            value={String(favPageSize)}
                            onChange={(val) => {
                              setFavPageSize(parseInt(val));
                              setFavPage(1);
                            }}
                            options={[
                              { label: "5개", value: "5" },
                              { label: "10개", value: "10" },
                              { label: "20개", value: "20" },
                            ]}
                          />
                        </div>
                      </div>

                      {favError && (
                        <div className="text-sm text-red-600">{favError}</div>
                      )}
                      {favLoading && (
                        <div className="text-sm text-gray-500">
                          관심 프리랜서를 불러오는 중…
                        </div>
                      )}

                      {(() => {
                        const q = favSearch.trim().toLowerCase();
                        const searched = q
                          ? favFreelancers.filter(
                              (f) =>
                                f.name.toLowerCase().includes(q) ||
                                (f.experience || "").toLowerCase().includes(q)
                            )
                          : favFreelancers;
                        const sorted = [...searched].sort((a, b) => {
                          const dir = favSortDir === "asc" ? 1 : -1;
                          if (favSortKey === "rating") {
                            return (
                              ((a.averageRating ?? 0) -
                                (b.averageRating ?? 0)) *
                              dir
                            );
                          }
                          return a.name.localeCompare(b.name) * dir;
                        });
                        const start = (favPage - 1) * favPageSize;
                        const visible = sorted.slice(
                          start,
                          start + favPageSize
                        );
                        return visible;
                      })().map((freelancer) => (
                        <div
                          key={freelancer.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {freelancer.profileImgUrl ? (
                                <img
                                  src={freelancer.profileImgUrl}
                                  alt={freelancer.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                  {freelancer.name.charAt(0)}
                                </div>
                              )}
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {freelancer.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {freelancer.experience}
                                </p>
                                {/* 평균 평점 표시 제거 */}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Link to={`/freelancers/${freelancer.id}`}>
                                <Button variant="outline" size="sm">
                                  <i className="ri-user-line mr-1"></i>
                                  프로필 보기
                                </Button>
                              </Link>
                              <Link
                                to={`/freelancers/${freelancer.id}/propose`}
                              >
                                <Button size="sm">
                                  <i className="ri-send-plane-line mr-1"></i>
                                  제안하기
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  toggleFavFreelancerDetail(freelancer.memberId)
                                }
                              >
                                <i className="ri-information-line mr-1"></i>{" "}
                                자세히
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  removeBookmark(
                                    freelancer.memberId,
                                    "freelancer"
                                  )
                                }
                              >
                                <i className="ri-heart-fill text-red-500"></i>
                              </Button>
                            </div>
                          </div>
                          {favFreelancerDetailOpen[freelancer.memberId] && (
                            <div className="mt-4 border-t pt-3">
                              {favFreelancerDetailLoading[
                                freelancer.memberId
                              ] && (
                                <div className="text-sm text-gray-500">
                                  상세 정보를 불러오는 중…
                                </div>
                              )}
                              {favFreelancerDetailError[
                                freelancer.memberId
                              ] && (
                                <div className="text-sm text-red-600">
                                  {
                                    favFreelancerDetailError[
                                      freelancer.memberId
                                    ]
                                  }
                                </div>
                              )}
                              {!favFreelancerDetailLoading[
                                freelancer.memberId
                              ] &&
                                !favFreelancerDetailError[
                                  freelancer.memberId
                                ] &&
                                favFreelancerDetail[freelancer.memberId] && (
                                  <div className="space-y-3">
                                    {(() => {
                                      const detail =
                                        favFreelancerDetail[
                                          freelancer.memberId
                                        ] || {};
                                      const skills: string[] = Array.isArray(
                                        detail.skills
                                      )
                                        ? detail.skills
                                        : [];
                                      const interests: string[] = Array.isArray(
                                        detail.interests
                                      )
                                        ? detail.interests
                                        : [];
                                      const comment: string =
                                        detail.comment || "";
                                      const careerObj: Record<string, number> =
                                        detail.career || {};
                                      const totalMonths = Object.values(
                                        careerObj
                                      ).reduce(
                                        (acc: number, m: any) =>
                                          acc + (Number(m) || 0),
                                        0
                                      );
                                      const years = Math.floor(
                                        totalMonths / 12
                                      );
                                      const months = totalMonths % 12;
                                      return (
                                        <>
                                          {skills.length > 0 && (
                                            <div>
                                              <div className="text-sm font-medium text-gray-700 mb-1">
                                                기술 스택
                                              </div>
                                              <div className="flex flex-wrap gap-1">
                                                {skills
                                                  .slice(0, 10)
                                                  .map((s: string) => (
                                                    <span
                                                      key={s}
                                                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                                                    >
                                                      {s}
                                                    </span>
                                                  ))}
                                              </div>
                                            </div>
                                          )}
                                          {interests.length > 0 && (
                                            <div>
                                              <div className="text-sm font-medium text-gray-700 mb-1">
                                                관심 분야
                                              </div>
                                              <div className="flex flex-wrap gap-1">
                                                {interests
                                                  .slice(0, 10)
                                                  .map((it: string) => (
                                                    <span
                                                      key={it}
                                                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                                    >
                                                      {it}
                                                    </span>
                                                  ))}
                                              </div>
                                            </div>
                                          )}
                                          {(years > 0 || months > 0) && (
                                            <div className="text-sm text-gray-700">
                                              총 경력:{" "}
                                              {years > 0 ? `${years}년 ` : ""}
                                              {months > 0
                                                ? `${months}개월`
                                                : ""}
                                            </div>
                                          )}
                                          {comment && (
                                            <div>
                                              <div className="text-sm font-medium text-gray-700 mb-1">
                                                소개
                                              </div>
                                              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                                {comment}
                                              </p>
                                            </div>
                                          )}
                                        </>
                                      );
                                    })()}
                                  </div>
                                )}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* pagination */}
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={favPage <= 1}
                          onClick={() =>
                            setFavPage((prev) => Math.max(1, prev - 1))
                          }
                          className="rounded-xl"
                        >
                          이전
                        </Button>
                        <span className="text-sm text-gray-600">
                          {(() => {
                            const q = favSearch.trim().toLowerCase();
                            const searched = q
                              ? favFreelancers.filter(
                                  (f) =>
                                    f.name.toLowerCase().includes(q) ||
                                    (f.experience || "")
                                      .toLowerCase()
                                      .includes(q)
                                )
                              : favFreelancers;
                            const totalPages = Math.max(
                              1,
                              Math.ceil(searched.length / favPageSize)
                            );
                            return `${favPage} / ${totalPages}`;
                          })()}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const q = favSearch.trim().toLowerCase();
                            const searched = q
                              ? favFreelancers.filter(
                                  (f) =>
                                    f.name.toLowerCase().includes(q) ||
                                    (f.experience || "")
                                      .toLowerCase()
                                      .includes(q)
                                )
                              : favFreelancers;
                            const totalPages = Math.max(
                              1,
                              Math.ceil(searched.length / favPageSize)
                            );
                            setFavPage((prev) =>
                              Math.min(totalPages, prev + 1)
                            );
                          }}
                          className="rounded-xl"
                        >
                          다음
                        </Button>
                      </div>

                      {favFreelancers.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <i className="ri-heart-line text-4xl mb-2"></i>
                          <p>관심 프리랜서가 없습니다.</p>
                          <Link to="/freelancers">
                            <Button variant="outline" className="mt-3">
                              프리랜서 찾아보기
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    // 프리랜서 - 관심 프로젝트
                    <div className="space-y-4">
                      {/* 검색/정렬/페이지 크기 */}
                      <div className="flex flex-wrap items-end gap-3 mb-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            검색
                          </label>
                          <Input
                            name="favProjSearch"
                            placeholder="제목/요약 검색"
                            value={favProjSearch}
                            onChange={(e) => {
                              setFavProjSearch(e.target.value);
                              setFavProjPage(1);
                            }}
                            className="rounded-xl w-56"
                          />
                        </div>
                        <div className="w-56">
                          <Select
                            label="정렬"
                            value={`${favProjSortKey}:${favProjSortDir}`}
                            onChange={(val) => {
                              const [k, d] = (val as string).split(":") as [
                                typeof favProjSortKey,
                                typeof favProjSortDir
                              ];
                              setFavProjSortKey(k);
                              setFavProjSortDir(d);
                            }}
                            options={[
                              { label: "마감 최신순", value: "deadline:desc" },
                              { label: "마감 오래된순", value: "deadline:asc" },
                              { label: "예산 높은순", value: "budget:desc" },
                              { label: "예산 낮은순", value: "budget:asc" },
                              { label: "제목 오름차순", value: "title:asc" },
                              { label: "제목 내림차순", value: "title:desc" },
                            ]}
                          />
                        </div>
                        <div className="w-40">
                          <Select
                            label="페이지 크기"
                            value={String(favProjPageSize)}
                            onChange={(val) => {
                              setFavProjPageSize(parseInt(val));
                              setFavProjPage(1);
                            }}
                            options={[
                              { label: "5개", value: "5" },
                              { label: "10개", value: "10" },
                              { label: "20개", value: "20" },
                            ]}
                          />
                        </div>
                      </div>

                      {favProjError && (
                        <div className="text-sm text-red-600">
                          {favProjError}
                        </div>
                      )}
                      {favProjLoading && (
                        <div className="text-sm text-gray-500">
                          관심 프로젝트를 불러오는 중…
                        </div>
                      )}

                      {(() => {
                        const q = favProjSearch.trim().toLowerCase();
                        const searched = q
                          ? favProjects.filter(
                              (p) =>
                                p.title?.toLowerCase().includes(q) ||
                                (p.description || "").toLowerCase().includes(q)
                            )
                          : favProjects;
                        const sorted = [...searched].sort((a, b) => {
                          const dir = favProjSortDir === "asc" ? 1 : -1;
                          if (favProjSortKey === "budget") {
                            return ((a.budget ?? 0) - (b.budget ?? 0)) * dir;
                          }
                          if (favProjSortKey === "deadline") {
                            return (
                              (new Date(a.deadline).getTime() -
                                new Date(b.deadline).getTime()) *
                              dir
                            );
                          }
                          return a.title.localeCompare(b.title) * dir;
                        });
                        const start = (favProjPage - 1) * favProjPageSize;
                        return sorted.slice(start, start + favProjPageSize);
                      })().map((project: any) => (
                        <div
                          key={project.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {project.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {project.description}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {project.clientName}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  project.status === "OPEN"
                                    ? "bg-green-100 text-green-800"
                                    : project.status === "IN_PROGRESS"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {project.status}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  removeBookmark(project.id, "project")
                                }
                              >
                                <i className="ri-heart-fill text-red-500"></i>
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex space-x-4 text-sm text-gray-600">
                              <span>예산: {project.budget}</span>
                              <span>기간: {project.duration}</span>
                              <span>마감: {project.deadline}</span>
                            </div>

                            <div className="flex space-x-2">
                              <Link to={`/projects/${project.id}`}>
                                <Button variant="outline" size="sm">
                                  상세보기
                                </Button>
                              </Link>
                            </div>
                          </div>

                          <div className="mt-3">
                            <div className="flex flex-wrap gap-1">
                              {project.skills
                                .slice(0, 4)
                                .map((skill: string) => (
                                  <span
                                    key={skill}
                                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                                  >
                                    {skill}
                                  </span>
                                ))}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* pagination */}
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={favProjPage <= 1}
                          onClick={() =>
                            setFavProjPage((prev) => Math.max(1, prev - 1))
                          }
                          className="rounded-xl"
                        >
                          이전
                        </Button>
                        <span className="text-sm text-gray-600">
                          {(() => {
                            const q = favProjSearch.trim().toLowerCase();
                            const searched = q
                              ? favProjects.filter(
                                  (p) =>
                                    p.title?.toLowerCase().includes(q) ||
                                    (p.description || "")
                                      .toLowerCase()
                                      .includes(q)
                                )
                              : favProjects;
                            const totalPages = Math.max(
                              1,
                              Math.ceil(searched.length / favProjPageSize)
                            );
                            return `${favProjPage} / ${totalPages}`;
                          })()}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const q = favProjSearch.trim().toLowerCase();
                            const searched = q
                              ? favProjects.filter(
                                  (p) =>
                                    p.title?.toLowerCase().includes(q) ||
                                    (p.description || "")
                                      .toLowerCase()
                                      .includes(q)
                                )
                              : favProjects;
                            const totalPages = Math.max(
                              1,
                              Math.ceil(searched.length / favProjPageSize)
                            );
                            setFavProjPage((prev) =>
                              Math.min(totalPages, prev + 1)
                            );
                          }}
                          className="rounded-xl"
                        >
                          다음
                        </Button>
                      </div>

                      {favProjects.length === 0 && !favProjLoading && (
                        <div className="text-center py-8 text-gray-500">
                          <i className="ri-heart-line text-4xl mb-2"></i>
                          <p>관심 프로젝트가 없습니다.</p>
                          <Link to="/projects">
                            <Button variant="outline" className="mt-3">
                              프로젝트 찾아보기
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 피드백 관리 */}
              {activeTab === "feedback" && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    피드백 관리
                  </h2>

                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">
                        총 {evaluations.length} 개의 리뷰
                      </p>
                    </div>

                    {evaluationsLoading && (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">
                          평가를 불러오는 중...
                        </span>
                      </div>
                    )}

                    {evaluationsError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-600">{evaluationsError}</p>
                      </div>
                    )}

                    {!evaluationsLoading &&
                      !evaluationsError &&
                      evaluations.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-gray-500">
                            아직 받은 평가가 없습니다.
                          </p>
                        </div>
                      )}

                    {!evaluationsLoading &&
                      !evaluationsError &&
                      evaluations.length > 0 && (
                        <div className="space-y-4">
                          {evaluations.map((evaluation) => (
                            <Card key={evaluation.evaluationId} className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h3 className="font-semibold text-gray-900">
                                    프로젝트 ID: {evaluation.projectId}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    {new Date(
                                      evaluation.createdAt || 0
                                    ).toLocaleDateString("ko-KR")}
                                  </p>
                                </div>
                              </div>

                              {evaluation.comment && (
                                <div className="mb-4">
                                  <h4 className="font-medium text-gray-700 mb-2">
                                    코멘트
                                  </h4>
                                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    {evaluation.comment}
                                  </p>
                                </div>
                              )}

                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {evaluation.ratingSatisfaction &&
                                  evaluation.ratingSatisfaction > 0 && (
                                    <div className="text-center">
                                      <p className="text-sm text-gray-500 mb-1">
                                        만족도
                                      </p>
                                      <div className="flex justify-center">
                                        {[...Array(5)].map((_, i) => (
                                          <span
                                            key={i}
                                            className={`text-lg ${
                                              i <
                                              (evaluation.ratingSatisfaction ||
                                                0)
                                                ? "text-yellow-400"
                                                : "text-gray-300"
                                            }`}
                                          >
                                            ★
                                          </span>
                                        ))}
                                      </div>
                                      <p className="text-sm text-gray-600 mt-1">
                                        {evaluation.ratingSatisfaction}/5
                                      </p>
                                    </div>
                                  )}

                                {evaluation.ratingProfessionalism &&
                                  evaluation.ratingProfessionalism > 0 && (
                                    <div className="text-center">
                                      <p className="text-sm text-gray-500 mb-1">
                                        전문성
                                      </p>
                                      <div className="flex justify-center">
                                        {[...Array(5)].map((_, i) => (
                                          <span
                                            key={i}
                                            className={`text-lg ${
                                              i <
                                              (evaluation.ratingProfessionalism ||
                                                0)
                                                ? "text-yellow-400"
                                                : "text-gray-300"
                                            }`}
                                          >
                                            ★
                                          </span>
                                        ))}
                                      </div>
                                      <p className="text-sm text-gray-600 mt-1">
                                        {evaluation.ratingProfessionalism}/5
                                      </p>
                                    </div>
                                  )}

                                {evaluation.ratingScheduleAdherence &&
                                  evaluation.ratingScheduleAdherence > 0 && (
                                    <div className="text-center">
                                      <p className="text-sm text-gray-500 mb-1">
                                        일정 준수
                                      </p>
                                      <div className="flex justify-center">
                                        {[...Array(5)].map((_, i) => (
                                          <span
                                            key={i}
                                            className={`text-lg ${
                                              i <
                                              (evaluation.ratingScheduleAdherence ||
                                                0)
                                                ? "text-yellow-400"
                                                : "text-gray-300"
                                            }`}
                                          >
                                            ★
                                          </span>
                                        ))}
                                      </div>
                                      <p className="text-sm text-gray-600 mt-1">
                                        {evaluation.ratingScheduleAdherence}/5
                                      </p>
                                    </div>
                                  )}

                                {evaluation.ratingCommunication &&
                                  evaluation.ratingCommunication > 0 && (
                                    <div className="text-center">
                                      <p className="text-sm text-gray-500 mb-1">
                                        소통
                                      </p>
                                      <div className="flex justify-center">
                                        {[...Array(5)].map((_, i) => (
                                          <span
                                            key={i}
                                            className={`text-lg ${
                                              i <
                                              (evaluation.ratingCommunication ||
                                                0)
                                                ? "text-yellow-400"
                                                : "text-gray-300"
                                            }`}
                                          >
                                            ★
                                          </span>
                                        ))}
                                      </div>
                                      <p className="text-sm text-gray-600 mt-1">
                                        {evaluation.ratingCommunication}/5
                                      </p>
                                    </div>
                                  )}

                                {evaluation.ratingProactiveness &&
                                  evaluation.ratingProactiveness > 0 && (
                                    <div className="text-center">
                                      <p className="text-sm text-gray-500 mb-1">
                                        적극성
                                      </p>
                                      <div className="flex justify-center">
                                        {[...Array(5)].map((_, i) => (
                                          <span
                                            key={i}
                                            className={`text-lg ${
                                              i <
                                              (evaluation.ratingProactiveness ||
                                                0)
                                                ? "text-yellow-400"
                                                : "text-gray-300"
                                            }`}
                                          >
                                            ★
                                          </span>
                                        ))}
                                      </div>
                                      <p className="text-sm text-gray-600 mt-1">
                                        {evaluation.ratingProactiveness}/5
                                      </p>
                                    </div>
                                  )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* 내가 등록한 피드백 */}
              {activeTab === "mefeedback" && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    내가 등록한 피드백
                  </h2>

                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">
                        총 {writtenEvaluations.length} 개의 리뷰 작성
                      </p>
                    </div>

                    {writtenEvaluationsLoading && (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">
                          작성한 평가를 불러오는 중...
                        </span>
                      </div>
                    )}

                    {writtenEvaluationsError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-600">
                          {writtenEvaluationsError}
                        </p>
                      </div>
                    )}

                    {!writtenEvaluationsLoading &&
                      !writtenEvaluationsError &&
                      writtenEvaluations.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-gray-500">
                            아직 작성한 평가가 없습니다.
                          </p>
                        </div>
                      )}

                    {!writtenEvaluationsLoading &&
                      !writtenEvaluationsError &&
                      writtenEvaluations.length > 0 && (
                        <div className="space-y-4">
                          {writtenEvaluations.map((evaluation) => (
                            <Card key={evaluation.evaluationId} className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h3 className="font-semibold text-gray-900">
                                    프로젝트 ID: {evaluation.projectId}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    {new Date(
                                      evaluation.createdAt || 0
                                    ).toLocaleDateString("ko-KR")}
                                  </p>
                                </div>
                              </div>

                              {evaluation.comment && (
                                <div className="mb-4">
                                  <h4 className="font-medium text-gray-700 mb-2">
                                    코멘트
                                  </h4>
                                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    {evaluation.comment}
                                  </p>
                                </div>
                              )}

                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {evaluation.ratingSatisfaction &&
                                  evaluation.ratingSatisfaction > 0 && (
                                    <div className="text-center">
                                      <p className="text-sm text-gray-500 mb-1">
                                        만족도
                                      </p>
                                      <div className="flex justify-center">
                                        {[...Array(5)].map((_, i) => (
                                          <span
                                            key={i}
                                            className={`text-lg ${
                                              i <
                                              (evaluation.ratingSatisfaction ||
                                                0)
                                                ? "text-yellow-400"
                                                : "text-gray-300"
                                            }`}
                                          >
                                            ★
                                          </span>
                                        ))}
                                      </div>
                                      <p className="text-sm text-gray-600 mt-1">
                                        {evaluation.ratingSatisfaction}/5
                                      </p>
                                    </div>
                                  )}

                                {evaluation.ratingProfessionalism &&
                                  evaluation.ratingProfessionalism > 0 && (
                                    <div className="text-center">
                                      <p className="text-sm text-gray-500 mb-1">
                                        전문성
                                      </p>
                                      <div className="flex justify-center">
                                        {[...Array(5)].map((_, i) => (
                                          <span
                                            key={i}
                                            className={`text-lg ${
                                              i <
                                              (evaluation.ratingProfessionalism ||
                                                0)
                                                ? "text-yellow-400"
                                                : "text-gray-300"
                                            }`}
                                          >
                                            ★
                                          </span>
                                        ))}
                                      </div>
                                      <p className="text-sm text-gray-600 mt-1">
                                        {evaluation.ratingProfessionalism}/5
                                      </p>
                                    </div>
                                  )}

                                {evaluation.ratingScheduleAdherence &&
                                  evaluation.ratingScheduleAdherence > 0 && (
                                    <div className="text-center">
                                      <p className="text-sm text-gray-500 mb-1">
                                        일정 준수
                                      </p>
                                      <div className="flex justify-center">
                                        {[...Array(5)].map((_, i) => (
                                          <span
                                            key={i}
                                            className={`text-lg ${
                                              i <
                                              (evaluation.ratingScheduleAdherence ||
                                                0)
                                                ? "text-yellow-400"
                                                : "text-gray-300"
                                            }`}
                                          >
                                            ★
                                          </span>
                                        ))}
                                      </div>
                                      <p className="text-sm text-gray-600 mt-1">
                                        {evaluation.ratingScheduleAdherence}/5
                                      </p>
                                    </div>
                                  )}

                                {evaluation.ratingCommunication &&
                                  evaluation.ratingCommunication > 0 && (
                                    <div className="text-center">
                                      <p className="text-sm text-gray-500 mb-1">
                                        소통
                                      </p>
                                      <div className="flex justify-center">
                                        {[...Array(5)].map((_, i) => (
                                          <span
                                            key={i}
                                            className={`text-lg ${
                                              i <
                                              (evaluation.ratingCommunication ||
                                                0)
                                                ? "text-yellow-400"
                                                : "text-gray-300"
                                            }`}
                                          >
                                            ★
                                          </span>
                                        ))}
                                      </div>
                                      <p className="text-sm text-gray-600 mt-1">
                                        {evaluation.ratingCommunication}/5
                                      </p>
                                    </div>
                                  )}

                                {evaluation.ratingProactiveness &&
                                  evaluation.ratingProactiveness > 0 && (
                                    <div className="text-center">
                                      <p className="text-sm text-gray-500 mb-1">
                                        적극성
                                      </p>
                                      <div className="flex justify-center">
                                        {[...Array(5)].map((_, i) => (
                                          <span
                                            key={i}
                                            className={`text-lg ${
                                              i <
                                              (evaluation.ratingProactiveness ||
                                                0)
                                                ? "text-yellow-400"
                                                : "text-gray-300"
                                            }`}
                                          >
                                            ★
                                          </span>
                                        ))}
                                      </div>
                                      <p className="text-sm text-gray-600 mt-1">
                                        {evaluation.ratingProactiveness}/5
                                      </p>
                                    </div>
                                  )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* 소셜 계정 연결 관리 */}
              {activeTab === "social" && <MyPageSocial />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
