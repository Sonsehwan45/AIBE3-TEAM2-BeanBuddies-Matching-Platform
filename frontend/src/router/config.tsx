import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
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
import ProjectApply from "../pages/projects/[id]/apply/page";
import ProjectsEditPage from "../pages/projects/[id]/edit/page";
import ProjectDetail from "../pages/projects/[id]/page";
import ProjectCreate from "../pages/projects/create/page";
import Projects from "../pages/projects/page";
import Recommendations from "../pages/recommendations/page";

interface RouteProps {
  userType?: "client" | "freelancer";
  setUserType?: (type: "client" | "freelancer") => void;
}

const routes: RouteObject[] = [
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
    element: ({ userType }: RouteProps) => <Projects userType={userType} />,
  },
  {
    path: "/projects/:id",
    element: ({ userType }: RouteProps) => (
      <ProjectDetail userType={userType} />
    ),
  },
  {
    path: "/projects/:id/apply",
    element: <ProjectApply />,
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
    element: ({ userType }: RouteProps) => (
      <Recommendations userType={userType} />
    ),
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
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
