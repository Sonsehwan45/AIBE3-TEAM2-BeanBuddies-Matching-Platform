// src/pages/recommendations/page.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/base/Button';
import client from '@/global/backend/client';

/** ====== DTO 타입 (백엔드 계약에 맞춰 방어적으로 정의) ====== */
type ProjectRec = {
    id: number;
    title?: string;
    summary?: string;
    price?: number;
    duration?: string;
    deadline?: string;
    status?: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED';
    ownerName?: string;
    createDate?: string;
    skills?: ({ id?: number; name: string } | string)[];
    matchRate?: number;  // 0~100 가정
    reason?: string;
};

type FreelancerRec = {
    freelancerId: number;
    name?: string;
    rating?: number;
    pastProjects?: number;
    skills?: ({ id?: number; name: string } | string)[];
    matchRate?: number;
    reason?: string;
};

type PageDto<T> = {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
};

/** ====== 컴포넌트 ====== */
export default function RecommendationsPage() {
    const { user, isLoggedIn } = useAuth();
    const role = user?.role;
    const isFreelancer = isLoggedIn && role === 'FREELANCER';
    const isClient = isLoggedIn && role === 'CLIENT';

    const [tab, setTab] = useState<'recommendations' | 'criteria'>('recommendations');

    // 데이터 상태
    const [projects, setProjects] = useState<ProjectRec[]>([]);
    const [freelancers, setFreelancers] = useState<FreelancerRec[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorText, setErrorText] = useState<string | null>(null);

    // 페이지네이션
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // 즐겨찾기(프론트 전용)
    const [favorites, setFavorites] = useState<number[]>([]);
    const toggleFavorite = (id: number) =>
        setFavorites((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));

    // 요청 취소용
    const abortRef = useRef<AbortController | null>(null);

    const titleText = useMemo(() => {
        if (isFreelancer) return 'AI가 분석한 나에게 적합한 프로젝트를 추천합니다';
        if (isClient) return 'AI가 분석한 프로젝트에 적합한 프리랜서를 추천합니다';
        return '로그인하면 맞춤 추천을 볼 수 있어요';
    }, [isClient, isFreelancer]);

    const resetAll = () => {
        setProjects([]);
        setFreelancers([]);
        setPage(0);
        setTotalPages(0);
        setTotalElements(0);
        setErrorText(null);
        setFavorites([]);
    };

    const normalizeSkills = (skills?: ProjectRec['skills'] | FreelancerRec['skills']) =>
        (skills ?? []).map((s) =>
            typeof s === 'string'
                ? { key: s, label: s }
                : { key: s.id ?? s.name, label: s.name }
        );

    const scrollToTop = () => {
        try {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {}
    };

    /** 공통 추천 호출 (역할에 따라 반환 타입이 달라짐) */
    const fetchRecommendations = async (nextPage = page) => {
        // 오래된 요청 취소
        abortRef.current?.abort();
        const ac = new AbortController();
        abortRef.current = ac;

        try {
            setLoading(true);
            setErrorText(null);

            const qs = new URLSearchParams();
            qs.set('page', String(nextPage));
            qs.set('size', '10');
            // ※ 클라이언트가 특정 프로젝트 기준으로 보고 싶으면 qs.set('projectId', '...') 넣으면 됨

            const { data, error } = await client.GET(
                `/api/v1/recommendations?${qs.toString()}`,
                { signal: ac.signal as any } as any
            );
            if (error) throw error;

            const pd = (data?.data ?? {
                content: [],
                number: 0,
                totalElements: 0,
                totalPages: 0,
            }) as PageDto<ProjectRec | FreelancerRec>;

            setPage(pd.number ?? 0);
            setTotalPages(pd.totalPages ?? 0);
            setTotalElements(pd.totalElements ?? 0);

            if (isFreelancer) {
                setProjects(((pd.content ?? []) as ProjectRec[]) || []);
                setFreelancers([]); // 방어
            } else if (isClient) {
                setFreelancers(((pd.content ?? []) as FreelancerRec[]) || []);
                setProjects([]); // 방어
            } else {
                setProjects([]);
                setFreelancers([]);
            }
        } catch (e: any) {
            // 백엔드가 401-1/401-2 같은 코드를 던질 수 있으니 친절 메시지
            const msg =
                e?.status === 401 || e?.code?.startsWith?.('401')
                    ? '로그인이 필요합니다.'
                    : isClient
                        ? '프리랜서 추천을 불러오는 중 오류가 발생했습니다.'
                        : '프로젝트 추천을 불러오는 중 오류가 발생했습니다.';
            setErrorText(msg);
        } finally {
            setLoading(false);
        }
    };

    // 역할이 바뀌면 상태 초기화 후 첫 페이지 로드
    useEffect(() => {
        resetAll();
        if (isFreelancer || isClient) fetchRecommendations(0);
        return () => abortRef.current?.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFreelancer, isClient]);

    // 페이지네이션
    const Pagination = () => {
        if (!totalPages) return null;
        const pages = Array.from({ length: totalPages }, (_, i) => i);
        const go = (p: number) => {
            if (p < 0 || p > totalPages - 1) return;
            fetchRecommendations(p);
            scrollToTop();
        };
        return (
            <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                    onClick={() => go(page - 1)}
                    disabled={page === 0}
                    className={`px-4 py-2 rounded-lg shadow-md ${
                        page === 0
                            ? 'bg-gray-100 text-gray-400'
                            : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-lg transition-shadow'
                    }`}
                >
                    <i className="ri-arrow-left-s-line"></i>
                </button>

                {pages.map((p) => (
                    <button
                        key={p}
                        onClick={() => go(p)}
                        className={`px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow ${
                            page === p ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        {p + 1}
                    </button>
                ))}

                <button
                    onClick={() => go(page + 1)}
                    disabled={page === totalPages - 1}
                    className={`px-4 py-2 rounded-lg shadow-md ${
                        page === totalPages - 1
                            ? 'bg-gray-100 text-gray-400'
                            : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-lg transition-shadow'
                    }`}
                >
                    <i className="ri-arrow-right-s-line"></i>
                </button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 헤더 */}
                <div className="mb-8">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                            <i className="ri-magic-line text-white text-2xl"></i>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">맞춤 추천</h1>
                            <p className="text-gray-600">{titleText}</p>
                        </div>
                    </div>
                </div>

                {/* 탭 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="border-b border-gray-200">
                        <div className="flex">
                            <button
                                onClick={() => setTab('recommendations')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                                    tab === 'recommendations'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <i className="ri-lightbulb-line mr-2"></i>
                                추천 목록
                            </button>
                            <button
                                onClick={() => setTab('criteria')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                                    tab === 'criteria'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <i className="ri-settings-line mr-2"></i>
                                추천 기준
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {tab === 'recommendations' ? (
                            <>
                                {loading ? (
                                    <p className="text-center text-gray-600 py-8">로딩 중...</p>
                                ) : errorText ? (
                                    <p className="text-center text-red-500 py-8">{errorText}</p>
                                ) : (
                                    <>
                                        <div className="mb-6">
                                            <p className="text-gray-600">
                                                총 <span className="font-semibold text-indigo-600">{totalElements}</span> 개의 추천 결과
                                            </p>
                                        </div>

                                        {/* 프리랜서 → 프로젝트 추천 */}
                                        {isFreelancer && (
                                            <div className="space-y-6">
                                                {projects.map((p) => {
                                                    const skills = normalizeSkills(p.skills);
                                                    return (
                                                        <div
                                                            key={p.id}
                                                            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 group"
                                                        >
                                                            <div className="flex items-start justify-between mb-4">
                                                                <div className="flex-1">
                                                                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                                                        {p.title ?? `프로젝트 #${p.id}`}
                                                                    </h3>
                                                                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                                                        {p.ownerName && (
                                                                            <span className="flex items-center">
                                        <i className="ri-building-line mr-1"></i>
                                                                                {p.ownerName}
                                      </span>
                                                                        )}
                                                                        {typeof p.price === 'number' && (
                                                                            <span className="flex items-center">
                                        <i className="ri-wallet-line mr-1"></i>
                                                                                {p.price.toLocaleString()}원
                                      </span>
                                                                        )}
                                                                        {p.duration && (
                                                                            <span className="flex items-center">
                                        <i className="ri-time-line mr-1"></i>
                                                                                {p.duration}
                                      </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-2xl font-bold text-green-600 mb-1">
                                                                        {Math.round(p.matchRate ?? 0)}%
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">매칭률</div>
                                                                </div>
                                                            </div>

                                                            {p.reason && (
                                                                <div className="bg-green-50 rounded-lg p-4 mb-4">
                                                                    <h4 className="font-medium text-green-900 mb-2">
                                                                        <i className="ri-lightbulb-line mr-2"></i>
                                                                        추천 이유
                                                                    </h4>
                                                                    <p className="text-green-800 text-sm">{p.reason}</p>
                                                                </div>
                                                            )}

                                                            {p.summary && (
                                                                <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">{p.summary}</p>
                                                            )}

                                                            {skills.length > 0 && (
                                                                <div className="flex flex-wrap gap-2 mb-4">
                                                                    {skills.map((s) => (
                                                                        <span
                                                                            key={`${p.id}-${s.key}`}
                                                                            className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-100"
                                                                        >
                                      {s.label}
                                    </span>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            <div className="flex items-center justify-between">
                                                                <div className="grid grid-cols-3 gap-6 text-sm">
                                                                    {p.deadline && (
                                                                        <div className="flex items-center text-gray-600">
                                                                            <i className="ri-calendar-deadline-line mr-2 text-red-500"></i>
                                                                            <div>
                                                                                <span className="block text-xs text-gray-500">마감</span>
                                                                                <span className="font-semibold text-red-600">
                                          {new Date(p.deadline).toLocaleDateString()}
                                        </span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {p.createDate && (
                                                                        <div className="flex items-center text-gray-600">
                                                                            <i className="ri-calendar-line mr-2 text-blue-500"></i>
                                                                            <div>
                                                                                <span className="block text-xs text-gray-500">등록일</span>
                                                                                <span className="font-semibold text-blue-600">
                                          {new Date(p.createDate).toLocaleDateString()}
                                        </span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {p.status && (
                                                                        <div className="flex items-center text-gray-600">
                                                                            <i className="ri-information-line mr-2"></i>
                                                                            {p.status === 'OPEN'
                                                                                ? '모집중'
                                                                                : p.status === 'IN_PROGRESS'
                                                                                    ? '진행중'
                                                                                    : p.status === 'COMPLETED'
                                                                                        ? '완료'
                                                                                        : '종료'}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="flex space-x-3">
                                                                    <Link to={`/projects/${p.id}`}>
                                                                        <Button variant="outline" className="rounded-xl">
                                                                            <i className="ri-eye-line mr-2"></i>
                                                                            자세히 보기
                                                                        </Button>
                                                                    </Link>
                                                                    {p.status === 'OPEN' && (
                                                                        <Link to={`/projects/${p.id}/apply`}>
                                                                            <Button className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600">
                                                                                <i className="ri-send-plane-line mr-2"></i>
                                                                                지원하기
                                                                            </Button>
                                                                        </Link>
                                                                    )}
                                                                    <button
                                                                        onClick={() => toggleFavorite(p.id)}
                                                                        className="ml-2 p-3 rounded-xl hover:bg-gray-100/50 transition-colors cursor-pointer"
                                                                        aria-label="즐겨찾기"
                                                                    >
                                                                        <i
                                                                            className={`text-xl ${
                                                                                favorites.includes(p.id)
                                                                                    ? 'ri-heart-fill text-red-500'
                                                                                    : 'ri-heart-line text-gray-400'
                                                                            }`}
                                                                        />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* 클라이언트 → 프리랜서 추천 */}
                                        {isClient && (
                                            <div className="space-y-6">
                                                {freelancers.map((f) => {
                                                    const skills = normalizeSkills(f.skills);
                                                    return (
                                                        <div
                                                            key={f.freelancerId}
                                                            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                                                        >
                                                            <div className="flex items-start justify-between mb-4">
                                                                <div className="flex items-start space-x-4">
                                                                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                                                                        {(f.name ?? 'F').charAt(0)}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                                                            {f.name ?? `프리랜서 #${f.freelancerId}`}
                                                                        </h3>
                                                                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                                                            {typeof f.rating === 'number' && (
                                                                                <div className="flex items-center">
                                                                                    <i className="ri-star-fill text-yellow-400 mr-1"></i>
                                                                                    <span>{f.rating}</span>
                                                                                </div>
                                                                            )}
                                                                            {typeof f.pastProjects === 'number' && (
                                                                                <span>프로젝트 {f.pastProjects}건</span>
                                                                            )}
                                                                        </div>
                                                                        {skills.length > 0 && (
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {skills.map((s) => (
                                                                                    <span
                                                                                        key={`${f.freelancerId}-${s.key}`}
                                                                                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                                                                                    >
                                            {s.label}
                                          </span>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-2xl font-bold text-green-600 mb-1">
                                                                        {Math.round(f.matchRate ?? 0)}%
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">매칭률</div>
                                                                </div>
                                                            </div>

                                                            {f.reason && (
                                                                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                                                                    <h4 className="font-medium text-blue-900 mb-2">
                                                                        <i className="ri-lightbulb-line mr-2"></i>
                                                                        추천 이유
                                                                    </h4>
                                                                    <p className="text-blue-800 text-sm">{f.reason}</p>
                                                                </div>
                                                            )}

                                                            <div className="flex space-x-3">
                                                                <Link to={`/freelancers/${f.freelancerId}`} className="flex-1">
                                                                    <Button variant="outline" className="w-full">프로필 보기</Button>
                                                                </Link>
                                                                <Link to={`/freelancers/${f.freelancerId}/propose`} className="flex-1">
                                                                    <Button className="w-full">프로젝트 제안하기</Button>
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {(isFreelancer ? projects.length : freelancers.length) > 0 && <Pagination />}

                                        {(isFreelancer ? projects.length : freelancers.length) === 0 && !loading && (
                                            <div className="text-center py-16">
                                                <div className="p-6 bg-white/50 rounded-2xl inline-block">
                                                    <i className="ri-search-line text-4xl text-gray-400 mb-4"></i>
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">추천이 비어있습니다</h3>
                                                    <p className="text-gray-500 mb-4">
                                                        프로필(프리랜서) / 최근 프로젝트(클라이언트)를 업데이트하면 더 정확해져요
                                                    </p>
                                                    <Button onClick={() => fetchRecommendations(0)} className="rounded-xl">
                                                        <i className="ri-refresh-line mr-2"></i> 다시 불러오기
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        ) : (
                            // 추천 기준 탭
                            <div className="space-y-6">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                        <i className="ri-magic-line mr-2"></i>AI 추천 시스템
                                    </h3>
                                    <p className="text-blue-800">
                                        로그인 사용자의 역할에 따라 추천 대상이 달라집니다.
                                        프리랜서는 내 프로필(직무/경력/기술스택)로 유사 프로젝트를, 클라이언트는
                                        최근 또는 지정한 프로젝트로 유사 프리랜서를 추천합니다.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {!isFreelancer && !isClient && (
                    <div className="text-center text-gray-600">
                        로그인하고 역할(프리랜서/클라이언트)을 설정하면 맞춤 추천을 받을 수 있어요.
                    </div>
                )}
            </div>
        </div>
    );
}