/**
 * aiCaseManage - 核心逻辑
 * 包含数据存储、页面路由、业务核验
 */

// 模拟数据库结构与初始数据
const INITIAL_DATA = {
    patients: [
        {
            id: '1',
            name: 'Zhang San',
            age: 35,
            visitCode: 'ABC123',
            status: 'Completed'
        },
        {
            id: '2',
            name: 'Li Si',
            age: 45,
            visitCode: 'DEF456',
            status: 'Completed'
        },
        {
            id: '3',
            name: 'Wang Wu',
            age: 28,
            visitCode: 'GHI789',
            status: 'Completed'
        }
    ],
    tasks: [
        {
            id: 'T1001',
            patientId: '1',
            type: 'PRESCRIPTION',
            desc: 'Cold symptoms, prescription issued',
            status: 'COMPLETED',
            result: 'Prescribed cold medicine, 3x daily, 1 sachet per dose',
            completedBy: 'Dr. Zhang',
            completedAt: '2024-01-15 09:30:00'
        },
        {
            id: 'T1002',
            patientId: '1',
            type: 'IMAGING',
            desc: 'Chest CT scan',
            status: 'COMPLETED',
            result: 'Chest CT clear, no obvious abnormalities',
            completedBy: 'Technician Li',
            completedAt: '2024-01-15 10:15:00'
        },
        {
            id: 'T2001',
            patientId: '2',
            type: 'PRESCRIPTION',
            desc: 'Hypertension medication',
            status: 'COMPLETED',
            result: 'Prescribed antihypertensive, once daily',
            completedBy: 'Dr. Zhang',
            completedAt: '2024-01-15 14:20:00'
        },
        {
            id: 'T2002',
            patientId: '2',
            type: 'THERAPY',
            desc: 'Cervical physiotherapy',
            status: 'COMPLETED',
            result: 'Completed traction therapy, symptoms improved',
            completedBy: 'Therapist Wang',
            completedAt: '2024-01-15 15:30:00'
        },
        {
            id: 'T3001',
            patientId: '3',
            type: 'PRESCRIPTION',
            desc: 'Gastritis medication',
            status: 'COMPLETED',
            result: 'Prescribed gastric meds, twice daily before meals',
            completedBy: 'Dr. Zhang',
            completedAt: '2024-01-15 11:00:00'
        },
        {
            id: 'T3002',
            patientId: '3',
            type: 'IMAGING',
            desc: 'Abdominal ultrasound',
            status: 'COMPLETED',
            result: 'Mild gastric wall thickening, otherwise unremarkable',
            completedBy: 'Technician Li',
            completedAt: '2024-01-15 11:45:00'
        }
    ],
    logs: [
        {
            time: '2024-01-15 09:30:00',
            msg: 'Zhang San visit completed - Prescription'
        },
        {
            time: '2024-01-15 10:15:00',
            msg: 'Zhang San visit completed - Imaging'
        },
        {
            time: '2024-01-15 14:20:00',
            msg: 'Li Si visit completed - Prescription'
        },
        {
            time: '2024-01-15 15:30:00',
            msg: 'Li Si visit completed - Therapy'
        },
        {
            time: '2024-01-15 11:00:00',
            msg: 'Wang Wu visit completed - Prescription'
        },
        {
            time: '2024-01-15 11:45:00',
            msg: 'Wang Wu visit completed - Imaging'
        }
    ]
};

// Operators (mocked auth config)
const OPERATORS = {
    'DOC_01': { name: 'Dr. Zhang', role: 'DOCTOR', allowedLoc: 'DOC_OFFICE', pin: '1234' },
    'IMG_01': { name: 'Technician Li', role: 'IMAGING', allowedLoc: 'IMG_CENTER', pin: '1234' },
    'PHY_01': { name: 'Therapist Wang', role: 'THERAPIST', allowedLoc: 'PHYSIO_ROOM', pin: '1234' }
};

// Task types and required locations
const TASK_CONFIG = {
    'PRESCRIPTION': { label: '💊 Prescription', requiredLoc: 'DOC_OFFICE' },
    'IMAGING': { label: '🩻 Imaging', requiredLoc: 'IMG_CENTER' },
    'THERAPY': { label: '💆 Therapy', requiredLoc: 'PHYSIO_ROOM' }
};

class App {
    constructor() {
        this.data = this.loadData();
        this.init();
    }

    // --- 数据层 ---
    loadData() {
        const stored = localStorage.getItem('aiCaseManage_db');
        if (!stored) {
            // 初始化一些演示数据
            const demoData = JSON.parse(JSON.stringify(INITIAL_DATA));
            return demoData;
        }
        return JSON.parse(stored);
    }

    saveData() {
        localStorage.setItem('aiCaseManage_db', JSON.stringify(this.data));
        this.renderDashboard(); // 数据变动刷新仪表盘
    }

    logActivity(msg) {
        const log = { time: new Date().toLocaleString(), msg };
        this.data.logs.unshift(log);
        this.saveData();
    }
    // --- 系统管理 ---
    resetSystem() {
        if (confirm('⚠️ Are you sure you want to clear all data? This cannot be undone!')) {
            localStorage.removeItem('aiCaseManage_db');
            location.reload(); // 刷新页面
        }
    }

    // --- 视图层 ---
    init() {
        this.renderDashboard();
        this.renderPatientList();
        this.renderTaskList();
        
        // 绑定全局点击事件处理模态框关闭等
        window.onclick = (event) => {
            if (event.target.classList.contains('modal')) {
                event.target.classList.remove('open');
            }
        };
    }

    navigate(viewId) {
        document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.sidebar nav button').forEach(el => el.classList.remove('active'));
        
        document.getElementById(`view-${viewId}`).classList.add('active');
        event.currentTarget.classList.add('active');
        
        // 刷新对应视图数据
        if (viewId === 'patients') this.renderPatientList();
        if (viewId === 'tasks') this.renderTaskList();
    }

    openModal(modalId) {
        document.getElementById(modalId).classList.add('open');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('open');
    }

    // --- 业务逻辑：患者管理 ---
    handleAddPatient(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        // 生成随机6位就诊码 (模拟核验凭证)
        const visitCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        const newPatient = {
            id: Date.now().toString(),
            name: formData.get('name'),
            age: formData.get('age'),
            visitCode: visitCode,
            status: 'Waiting'
        };

        this.data.patients.push(newPatient);
        
        // 自动生成初始任务 (模拟医生开单)
        this.createTask(newPatient.id, 'PRESCRIPTION', '待医生开具处方');
        
        this.saveData();
        this.closeModal('modal-add-patient');
        this.renderPatientList();
        this.logActivity(`New patient registered: ${newPatient.name} (code:${visitCode})`);
        e.target.reset();
    }

    createTask(patientId, type, desc) {
        const task = {
            id: 'T' + Date.now() + Math.floor(Math.random()*100),
            patientId,
            type,
            desc,
            status: 'PENDING',
            result: null,
            completedBy: null,
            completedAt: null
        };
        this.data.tasks.push(task);
        this.saveData();
    }

    // --- 业务逻辑：任务核验与执行 (核心考核点) ---
    
    // 打开核验窗口
    openVerifyModal(taskId) {
        const task = this.data.tasks.find(t => t.id === taskId);
        const patient = this.data.patients.find(p => p.id === task.patientId);
        
        document.getElementById('verify-task-id').value = taskId;
        document.getElementById('verify-task-desc').innerHTML = `
            <strong>${TASK_CONFIG[task.type].label}</strong><br>
            Patient: ${patient.name}<br>
            <span style="color:red; font-size:12px;">Required location: ${TASK_CONFIG[task.type].requiredLoc}</span>
        `;
        this.openModal('modal-verify');
    }

    // 提交核验
    handleTaskExecution(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const taskId = formData.get('verify-task-id'); // 隐藏域获取
        const resultText = formData.get('result');
        const inputLocation = formData.get('location');
        const inputVisitCode = formData.get('visitCode');
        const operatorId = formData.get('operatorId');
        const inputPin = formData.get('pin');

        const task = this.data.tasks.find(t => t.id === taskId);
        const patient = this.data.patients.find(p => p.id === task.patientId);
        const operator = OPERATORS[operatorId];

        // --- Verification logic ---
        const errors = [];

        // 1. 校验 PIN 码
        if (operator.pin !== inputPin) {
            errors.push("❌ Operator PIN incorrect!");
        }

        // 2. 校验患者就诊码 (证明患者在场)
        if (inputVisitCode !== patient.visitCode) {
            errors.push("❌ Patient visit code does not match! Please verify the patient's identity.");
        }

        // 3. 校验地点与权限 (Location & Role Check)
        // 规则：当前地点必须匹配任务要求，且操作员必须有权在该地点操作
        const requiredLoc = TASK_CONFIG[task.type].requiredLoc;
        
        if (inputLocation !== requiredLoc) {
            errors.push(`❌ Location error! This task must be performed at [${requiredLoc}], current: [${inputLocation}]`);
        }
        
        if (operator.allowedLoc !== requiredLoc) {
            errors.push(`❌ Permission denied! Operator [${operator.name}] is not authorized to perform tasks at [${requiredLoc}].`);
        }

        if (errors.length > 0) {
            alert(errors.join('\n'));
            return;
        }

        // --- Verification passed, execute task ---
        task.status = 'COMPLETED';
        task.result = resultText;
        task.completedBy = operator.name;
        task.completedAt = new Date().toLocaleString();

        // 【优化】状态流转逻辑修正
        if (task.type === 'PRESCRIPTION') {
            patient.status = 'In Treatment';
            
            // 自动派发下一阶段
            if (Math.random() > 0.5) {
                this.createTask(patient.id, 'IMAGING', 'Order: Chest CT');
                alert('✅ Prescription issued. Imaging task auto-dispatched.');
            } else {
                this.createTask(patient.id, 'THERAPY', 'Order: Neck/shoulder therapy');
                alert('✅ Prescription issued. Therapy task auto-dispatched.');
            }
        } else {
            // 影像或理疗完成，流程结束
            patient.status = 'Completed';
            alert('✅ Task completed and archived!');
        }


        this.saveData();
        this.closeModal('modal-verify');
        this.renderTaskList();
        this.logActivity(`任务完成: ${TASK_CONFIG[task.type].label} - ${patient.name}`);
        e.target.reset();
    }

    // --- 渲染逻辑 ---
    renderDashboard() {
        document.getElementById('stat-total-patients').innerText = this.data.patients.length;
        document.getElementById('stat-pending-tasks').innerText = this.data.tasks.filter(t => t.status === 'PENDING').length;
        document.getElementById('stat-completed-tasks').innerText = this.data.tasks.filter(t => t.status === 'COMPLETED').length;

        const logList = document.getElementById('activity-log');
        logList.innerHTML = this.data.logs.slice(0, 5).map(log => `
            <li>
                <span>${log.msg}</span>
                <span class="log-time">${log.time.split(' ')[1]}</span>
            </li>
        `).join('');
    }

         renderPatientList() {
        const tbody = document.getElementById('patient-list-body');
        // 如果正在搜索，使用过滤后的数据，否则使用全部数据
        const sourceData = this.filteredPatients || this.data.patients;

        if (sourceData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#999;">No matching patients</td></tr>';
            return;
        }

        tbody.innerHTML = sourceData.map(p => `
            <tr>
                <td>${p.id}</td>
                <td>
                    <!-- 点击名字也可以弹出电子卡 -->
                    <span style="font-weight:bold; cursor:pointer; color:#2563eb;" onclick="app.showDigitalCard('${p.id}')">
                        ${p.name} 📱
                    </span>
                </td>
                <td><code style="background:#eee;padding:2px 4px;border-radius:4px;">${p.visitCode}</code></td>
                <td>
                    <span class="status-badge status-${getStatusClass(p.status)}">
                        ${p.status}
                    </span>
                </td>
                <td>
                    <button class="btn-sm" onclick="app.viewPatientHistory('${p.id}')">Details</button>
                    <button class="btn-sm btn-secondary" onclick="app.openEditPatient('${p.id}')">Edit</button>
                    <!-- Revisit -->
                    <button class="btn-sm" style="background:#8b5cf6; color:white; border:none;" onclick="app.startNewVisit('${p.id}')">New Visit</button>
                    <button class="btn-sm btn-danger" onclick="app.deletePatient('${p.id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    }



    filterTasks(type) {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        event.target.classList.add('active');
        this.renderTaskList(type);
    }

    renderTaskList(filterType = 'ALL') {
        const container = document.getElementById('task-list-container');
        let tasks = this.data.tasks;
        
        if (filterType !== 'ALL') {
            tasks = tasks.filter(t => t.type === filterType);
        }

        // 按时间倒序
        tasks.sort((a, b) => b.id.localeCompare(a.id));

        container.innerHTML = tasks.map(t => {
            const patient = this.data.patients.find(p => p.id === t.patientId) || {name: 'Unknown'};
            const config = TASK_CONFIG[t.type];
            const isDone = t.status === 'COMPLETED';

            return `
            <div class="task-card" style="border-left: 4px solid ${isDone ? '#10b981' : '#f59e0b'}">
                <div class="task-header">
                    <span style="font-weight:bold">${config.label}</span>
                    <span class="badge ${isDone ? 'badge-completed' : 'badge-pending'}">
                        ${isDone ? 'Completed' : 'Pending'}
                    </span>
                </div>
                <p style="font-size:14px; color:#666; margin-bottom:8px;">Patient: <strong>${patient.name}</strong></p>
                <p style="font-size:13px; margin-bottom:12px;">${t.desc}</p>
                
                ${isDone ? `
                    <div style="background:#f9fafb; padding:8px; font-size:12px; border-radius:4px;">
                        <p><strong>结果:</strong> ${t.result}</p>
                        <p style="color:#999; margin-top:4px;">Performed by: ${t.completedBy} @ ${t.completedAt}</p>
                    </div>
                ` : `
                    <div class="task-actions">
                        <button class="btn-primary btn-sm" onclick="app.openVerifyModal('${t.id}')">
                            ⚡ Execute & Verify
                        </button>
                    </div>
                `}
            </div>
            `;
        }).join('');
        
        if (tasks.length === 0) {
            container.innerHTML = '<p style="color:#999; text-align:center; grid-column:1/-1;">No tasks</p>';
        }
    }
        // --- 新增业务逻辑：查看患者病历详情 ---
    viewPatientHistory(patientId) {
        const patient = this.data.patients.find(p => p.id === patientId);
        if (!patient) return;

        // 1. 填充头部基础信息
        document.getElementById('history-p-name').innerText = patient.name;
        document.getElementById('history-p-code').innerText = patient.visitCode;
        document.getElementById('history-p-status').innerText = patient.status;

        // 2. 筛选并排序该患者的任务
        const tasks = this.data.tasks.filter(t => t.patientId === patientId);
        // 按 ID (时间) 正序排列，模拟就诊顺序
        tasks.sort((a, b) => a.id.localeCompare(b.id));

        // 3. 生成时间轴 HTML
        const timelineContainer = document.getElementById('history-timeline-list');
        
        if (tasks.length === 0) {
            timelineContainer.innerHTML = '<li style="color:#999">No treatment records</li>';
        } else {
            timelineContainer.innerHTML = tasks.map(t => {
                const isDone = t.status === 'COMPLETED';
                const config = TASK_CONFIG[t.type];
                
                return `
                <li class="timeline-item ${isDone ? 'done' : ''}">
                    <div class="timeline-content">
                        <span class="timeline-time">
                            ${isDone ? t.completedAt : 'Pending...'}
                        </span>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <strong>${config.label}</strong>
                            <span class="badge ${isDone ? 'badge-completed' : 'badge-pending'}">
                                ${isDone ? 'Completed' : 'In Progress'}
                            </span>
                        </div>
                        <p style="margin-top:8px; font-size:13px; color:#555;">
                            ${isDone ? `🏁 Result: ${t.result}<br><small>Performed by: ${t.completedBy}</small>` : `📝 Note: ${t.desc}`}
                        </p>
                    </div>
                </li>
                `;
            }).join('');
        }

        this.openModal('modal-patient-history');
    }
        // --- 新增 CRUD：删除患者 ---
    deletePatient(id) {
        if (!confirm('⚠️ 警告：删除患者将同步清空其所有诊疗记录！确定要删除吗？')) {
            return;
        }

        // 1. 删除患者
        this.data.patients = this.data.patients.filter(p => p.id !== id);
        
        // 2. 级联删除：把该患者关联的任务也删掉，防止产生垃圾数据
        this.data.tasks = this.data.tasks.filter(t => t.patientId !== id);

        this.saveData();
        this.renderPatientList();
        this.renderDashboard(); // 更新仪表盘数字
        this.logActivity(`管理员删除了患者 (ID: ${id})`);
    }

    // --- 新增 CRUD：打开编辑窗口 ---
    openEditPatient(id) {
        const patient = this.data.patients.find(p => p.id === id);
        if (!patient) return;

        // 回显数据到表单
        document.getElementById('edit-p-id').value = patient.id;
        document.getElementById('edit-p-name').value = patient.name;
        document.getElementById('edit-p-age').value = patient.age;
        document.getElementById('edit-p-code').value = patient.visitCode;

        this.openModal('modal-edit-patient');
    }

    // --- 新增 CRUD：保存编辑 ---
    handleEditPatient(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const id = formData.get('id');
        
        // 找到该患者
        const patient = this.data.patients.find(p => p.id === id);
        if (patient) {
            patient.name = formData.get('name');
            patient.age = formData.get('age');
            
            this.saveData();
            this.closeModal('modal-edit-patient');
            this.renderPatientList();
            this.logActivity(`更新了患者信息: ${patient.name}`);
        }
    }
        // --- 优化逻辑 1: 电子就诊卡 (模拟患者端) ---
    showDigitalCard(id) {
        const patient = this.data.patients.find(p => p.id === id);
        if (!patient) return;

        document.getElementById('card-visit-code').innerText = patient.visitCode;
        document.getElementById('card-p-name').innerText = patient.name;
        document.getElementById('card-p-status').innerText = patient.status;
        
        this.openModal('modal-digital-card');
    }

    // --- 优化逻辑 2: 全局搜索 ---
    handleSearch(keyword) {
        const term = keyword.toLowerCase().trim();
        
        if (!term) {
            this.filteredPatients = null; // 清空过滤
        } else {
            this.filteredPatients = this.data.patients.filter(p => 
                p.name.toLowerCase().includes(term) || 
                p.visitCode.toLowerCase().includes(term)
            );
        }
        this.renderPatientList();
    }

    // --- 优化逻辑 3: 老患复诊 ---
    startNewVisit(patientId) {
        const patient = this.data.patients.find(p => p.id === patientId);
        if (!confirm(`确认要为 [${patient.name}] 开启新的复诊流程吗？\n这将重置其状态并生成新处方任务。`)) return;

        // 1. 重置状态
        patient.status = '待诊';
        
        // 2. 生成新的处方任务
        this.createTask(patientId, 'PRESCRIPTION', '复诊：待医生开具处方');

        this.saveData();
        this.renderPatientList();
        this.renderTaskList();
        this.logActivity(`老患复诊: ${patient.name}`);
        alert('✅ 复诊成功！已生成新任务。');
    }

    // --- 优化逻辑 4: 数据导出 ---
    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aiCaseManage_Backup_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
    }



}

// 启动应用
const app = new App(
    
);
// 辅助函数：根据中文状态返回对应的 CSS 类名后缀
function getStatusClass(status) {
    if (status === 'Waiting') return 'waiting';
    if (status === 'In Treatment') return 'active';
    if (status === 'Completed') return 'done';
    return 'default';
}

