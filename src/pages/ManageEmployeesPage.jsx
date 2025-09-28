// src/pages/ManageEmployeesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import ThinSidebar from "../components/admin/ThinSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import EmployeeService from "../shared/api/manageEmployeeService";
import logoSrc from "../assets/imgs/caesar_logo.png";
import "../assets/styles/ManageEmployeesPage.css";

/** 부서/직급 옵션 (첨부 이미지 기준) */
const DEPT_OPTIONS = [
  { id: 1, name: "경영지원" }, { id: 2, name: "인사" }, { id: 3, name: "재무회계" },
  { id: 4, name: "법무" }, { id: 5, name: "총무" }, { id: 6, name: "영업" },
  { id: 7, name: "마케팅" }, { id: 8, name: "제품기획" }, { id: 9, name: "개발(백엔드)" },
  { id:10, name: "개발(프론트엔드)" }, { id:11, name: "데이터" }, { id:12, name: "인프라" },
  { id:13, name: "품질(QA)" }, { id:14, name: "고객지원(CS)" }, { id:15, name: "디자인" },
  { id:16, name: "운영" },
];
const RANK_OPTIONS = [
  { id: 1, name: "사원" }, { id: 2, name: "주임" }, { id: 3, name: "대리" },
  { id: 4, name: "과장" }, { id: 5, name: "차장" }, { id: 6, name: "부장" },
  { id: 7, name: "이사" }, { id: 8, name: "상무" }, { id: 9, name: "전무" },
  { id:10, name: "부사장" }, { id:11, name: "사장" }, { id:12, name: "대표이사" },
];

const deptNameById = Object.fromEntries(DEPT_OPTIONS.map(d => [d.id, d.name]));
const rankNameById = Object.fromEntries(RANK_OPTIONS.map(r => [r.id, r.name]));

export default function ManageEmployeesPage({ user, onLogout }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [editTarget, setEditTarget] = useState(null); // {id, job_dept_id, job_rank_id}
  const PAGE_SIZE = 12;

  // 목록 로드
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const list = await EmployeeService.listEmployees();

        // 백엔드 스키마가 달라도 안전하게 매핑
        const normalized = (list || []).map((e) => {
          const name = e.full_name ?? e.name ?? "-";
          const deptId = e.job_dept_id ?? e.dept_id ?? null;
          const rankId = e.job_rank_id ?? e.rank_id ?? null;
          const deptName = e.dept_name ?? (deptId ? deptNameById[deptId] : null);
          const rankName = e.rank_name ?? (rankId ? rankNameById[rankId] : null);
          return {
            ...e,
            name,
            job_dept_id: deptId,
            job_rank_id: rankId,
            dept_name: deptName,
            rank_name: rankName,
          };
        });

        setEmployees(normalized);
      } catch (e) {
        console.error("직원 목록 로드 실패:", e);
        // 네트워크 오류나 인증 오류가 아닌 경우에만 빈 배열 설정
        if (e.message !== "직원 목록 조회 실패") {
          setEmployees([]);
        }
        alert("직원 목록을 불러오는데 실패했습니다. 다시 시도해주세요.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 검색(부서/직급 포함)
  const filtered = useMemo(() => {
    const needle = (q || "").toLowerCase().trim();
    if (!needle) return employees;
    return employees.filter((e) =>
      [e.name, e.email, e.dept_name, e.rank_name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(needle))
    );
  }, [employees, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageClamped = Math.min(page, totalPages);
  const start = (pageClamped - 1) * PAGE_SIZE;
  const current = filtered.slice(start, start + PAGE_SIZE);

  const openEdit = (emp) => {
    setEditTarget({
      id: emp.id,
      name: emp.name,
      email: emp.email,
      job_dept_id: emp.job_dept_id ?? null,
      job_rank_id: emp.job_rank_id ?? null,
    });
  };

  const applyEdit = async () => {
    if (!editTarget) return;
    
    try {
      setLoading(true);
      
      // 백엔드 API 호출하여 직원 정보 수정
      const updatedEmployee = await EmployeeService.updateEmployee(editTarget.id, {
        job_dept_id: editTarget.job_dept_id,
        job_rank_id: editTarget.job_rank_id,
      });
      
      // 성공 시 로컬 상태 업데이트
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === editTarget.id
            ? {
                ...e,
                job_dept_id: updatedEmployee.job_dept_id,
                job_rank_id: updatedEmployee.job_rank_id,
                dept_name: updatedEmployee.dept_name,
                rank_name: updatedEmployee.rank_name,
              }
            : e
        )
      );
      
      setEditTarget(null);
      alert("직원 정보가 성공적으로 수정되었습니다.");
      
    } catch (error) {
      console.error("직원 정보 수정 실패:", error);
      alert("직원 정보 수정에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const removeRow = async (id) => {
    if (!window.confirm("이 직원을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    
    try {
      setLoading(true);
      
      // 백엔드 API 호출하여 직원 삭제
      await EmployeeService.deleteEmployee(id);
      
      // 성공 시 로컬 상태에서 제거
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      alert("직원이 성공적으로 삭제되었습니다.");
      
    } catch (error) {
      console.error("직원 삭제 실패:", error);
      alert("직원 삭제에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ThinSidebar logoSrc={logoSrc} />
      <div className="admin-page with-sidebar">
        <AdminHeader user={user} onLogout={onLogout} />

        <div className="employees-main">
          <div className="employees-head">
            <h2>직원 관리</h2>

            <div className="employees-actions">
              <div className="search-wrap">
                <input
                  className="search-input"
                  placeholder="이름, 이메일, 부서, 직급 검색…"
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                  }}
                />
                {q && (
                  <button className="search-clear" onClick={() => setQ("")} aria-label="검색어 지우기">
                    ✕
                  </button>
                )}
              </div>

              {/* 추후 초대/추가 버튼 연결 자리 */}
              <button className="primary-btn" disabled>
                + 직원 초대(준비중)
              </button>
            </div>
          </div>

          <div className="employees-card">
            {/* 컬럼: 이름 / 이메일 / 부서 / 직급 / 작업 */}
            <div className="employees-table header">
              <div>이름</div>
              <div>이메일</div>
              <div>부서</div>
              <div>직급</div>
              <div className="center">작업</div>
            </div>

            {loading ? (
              <div className="empty">
                <div style={{ marginBottom: '8px' }}>📋</div>
                직원 목록을 불러오는 중입니다...
              </div>
            ) : current.length === 0 ? (
              <div className="empty">
                <div style={{ marginBottom: '8px' }}>{q ? "🔍" : "👥"}</div>
                {q ? "검색 결과가 없습니다." : "등록된 직원이 없습니다."}
              </div>
            ) : (
              current.map((e) => (
                <div key={e.id} className="employees-table row">
                  <div className="name">
                    <div className="avatar">{(e.name || "?").slice(0, 1)}</div>
                    <span>{e.name || "-"}</span>
                  </div>

                  <div>{e.email || "-"}</div>
                  <div>{e.dept_name || "-"}</div>
                  <div>{e.rank_name || "-"}</div>

                  <div className="center">
                    <button className="action-btn edit" onClick={() => openEdit(e)}>수정</button>
                    <button className="action-btn delete" onClick={() => removeRow(e.id)}>
                      삭제
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="employees-paging">
              <button className="page-btn" disabled={pageClamped === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                이전
              </button>
              <span className="page-info">
                {pageClamped} / {totalPages}
              </span>
              <button className="page-btn" disabled={pageClamped === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                다음
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 편집 모달 */}
      {editTarget && (
        <EditModal
          target={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={applyEdit}
          onChange={(patch) => setEditTarget((prev) => ({ ...prev, ...patch }))}
          loading={loading}
        />
      )}
    </>
  );
}

/** 직원 정보 수정 모달 컴포넌트 */
function EditModal({ target, onClose, onSave, onChange, loading = false }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-head">
          <h3>직원 정보 수정</h3>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <label>이름</label>
            <input value={target.name} disabled className="input" />
          </div>
          <div className="form-row">
            <label>이메일</label>
            <input value={target.email} disabled className="input" />
          </div>

          <div className="form-row">
            <label>부서</label>
            <select
              className="input"
              value={target.job_dept_id ?? ""}
              onChange={(e) => onChange({ job_dept_id: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">선택안함</option>
              {DEPT_OPTIONS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>직급</label>
            <select
              className="input"
              value={target.job_rank_id ?? ""}
              onChange={(e) => onChange({ job_rank_id: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">선택안함</option>
              {RANK_OPTIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-foot">
          <button className="ghost-btn" onClick={onClose} disabled={loading}>
            취소
          </button>
          <button 
            className="primary-btn" 
            onClick={onSave} 
            disabled={loading}
          >
            {loading ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
