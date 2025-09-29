// src/shared/api/manageEmployeeService.js
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function authHeaders() {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * GET /api/admin/employees/list
 * 회사 직원 목록을 조회합니다.
 * 응답 예시:
 * [{ id, full_name, email, job_dept_id, job_rank_id, dept_name, rank_name, company_id, google_user_id }]
 */
async function listEmployees() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/employees/list`, {
      headers: { ...authHeaders() },
    });

    if (res.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("role");
      window.location.href = "/login";
      return [];
    }

    if (!res.ok) throw new Error("직원 목록 조회 실패");

    const data = await res.json();
    // 백엔드 응답을 프론트엔드에서 사용하기 쉽게 매핑 (안전한 처리)
    return (data || []).map((it) => ({
      id: it.id || 0,
      name: it.full_name || "",
      email: it.email || "",
      job_dept_id: it.job_dept_id || null,
      job_rank_id: it.job_rank_id || null,
      dept_name: it.dept_name || null,
      rank_name: it.rank_name || null,
      company_id: it.company_id || 0,
      google_user_id: it.google_user_id || "",
      createdAt: it.created_at || null,
    }));
  } catch (e) {
    console.error("직원 목록 조회 실패:", e?.message);
    throw e; // 에러를 다시 던져서 호출하는 곳에서 처리하도록 함
  }
}

/**
 * PUT /api/admin/employees/{employee_id}
 * 직원 정보를 수정합니다.
 */
async function updateEmployee(employeeId, updateData) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/employees/${employeeId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(updateData),
    });

    if (res.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("role");
      window.location.href = "/login";
      return null;
    }

    if (!res.ok) throw new Error("직원 정보 수정 실패");

    const data = await res.json();
    return {
      id: data.id,
      name: data.full_name || "",
      email: data.email || "",
      job_dept_id: data.job_dept_id,
      job_rank_id: data.job_rank_id,
      dept_name: data.dept_name,
      rank_name: data.rank_name,
      company_id: data.company_id,
      google_user_id: data.google_user_id,
    };
  } catch (e) {
    console.error("직원 정보 수정 실패:", e?.message);
    throw e;
  }
}

/**
 * DELETE /api/admin/employees/{employee_id}
 * 직원을 삭제합니다.
 */
async function deleteEmployee(employeeId) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/employees/${employeeId}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    });

    if (res.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("role");
      window.location.href = "/login";
      return false;
    }

    if (!res.ok) throw new Error("직원 삭제 실패");

    return true;
  } catch (e) {
    console.error("직원 삭제 실패:", e?.message);
    throw e;
  }
}

/**
 * GET /api/admin/employees/departments/list
 * 부서 목록을 조회합니다.
 */
async function listDepartments() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/employees/departments/list`, {
      headers: { ...authHeaders() },
    });

    if (res.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("role");
      window.location.href = "/login";
      return [];
    }

    if (!res.ok) throw new Error("부서 목록 조회 실패");

    return await res.json();
  } catch (e) {
    console.error("부서 목록 조회 실패:", e?.message);
    throw e;
  }
}

/**
 * GET /api/admin/employees/ranks/list
 * 직급 목록을 조회합니다.
 */
async function listRanks() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/employees/ranks/list`, {
      headers: { ...authHeaders() },
    });

    if (res.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("role");
      window.location.href = "/login";
      return [];
    }

    if (!res.ok) throw new Error("직급 목록 조회 실패");

    return await res.json();
  } catch (e) {
    console.error("직급 목록 조회 실패:", e?.message);
    throw e;
  }
}

export default {
  listEmployees,
  updateEmployee,
  deleteEmployee,
  listDepartments,
  listRanks,
};
