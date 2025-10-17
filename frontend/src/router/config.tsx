import type { RouteObject } from "react-router-dom";
import type { ReactNode } from "react";
import NotFound from "../pages/NotFound";
import ChangePassword from "../pages/auth/change-password/page";
import DeleteAccount from "../pages/auth/delete-account/page";
import ForgotPassword from "../pages/auth/forgot-password/page";
import Login from "../pages/auth/login/page";
import Signup from "../pages/auth/signup/page";
import Evaluation from "../pages/evaluation/page";
import FreelancerDetail from "../pages/freelancers/[id]/page";
import FreelancerPropose from "../pages/freelancers/[id]/propose/page";
import Freelancers from "../pages/freelancers/page";
import Home from "../pages/home/page";
import MyPage from "../pages/mypage/page";
import ProjectApplyDetail from "../pages/projects/[id]/apply/[applyId]/page";
import ProjectApplyCreate from "../pages/projects/[id]/apply/page";
import ProjectsEditPage from "../pages/projects/[id]/edit/page";
import ProjectDetail from "../pages/projects/[id]/page";
import ProjectCreate from "../pages/projects/create/page";
import Projects from "../pages/projects/page";
import Recommendations from "../pages/recommendations/page";

interface RouteProps {
  userType?: "client" | "freelancer";
  setUserType?: (type: "client" | "freelancer") => void;
}

// Allow element to be a ReactNode or a factory that receives RouteProps
export type AppRoute = Omit<RouteObject, "element" | "children"> & {
  element: ReactNode | ((props: RouteProps) => ReactNode);
  children?: AppRoute[];
};

const routes: AppRoute[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/auth/delete-account",
    element: <DeleteAccount />,
  },
  {
    path: "/projects",
    element: <Projects />,
  },
  {
    path: "/projects/:id",
    element: <ProjectDetail />,
  },
  {
    path: "/freelancers",
    element: ({ userType }: RouteProps) => <Freelancers userType={userType} />,
  },
  {
    path: "/freelancers/:id",
    element: ({ userType }: RouteProps) => (
      <FreelancerDetail userType={userType} />
    ),
  },
  {
    path: "/freelancers/:id/propose",
    element: <FreelancerPropose />,
  },
  {
    path: "/recommendations",
    element: <Recommendations />,
  },
  {
    path: "/mypage",
    element: ({ userType }: RouteProps) => <MyPage userType={userType} />,
  },
  {
    path: "/evaluation/:type/:projectId",
    element: <Evaluation />,
  },
  {
    path: "/projects/create",
    element: <ProjectCreate />,
  },
  {
    path: "/projects/:id/edit",
    element: <ProjectsEditPage />,
  },
  {
    path: "/auth/change-password",
    element: <ChangePassword />,
  },
  {
    path: "/projects/:id/apply",
    element: <ProjectApplyCreate />,
  },
  {
    path: "/projects/:id/apply/:applyId",
    element: <ProjectApplyDetail />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
