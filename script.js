/**
 * aiCaseManage - 核心逻辑
 * 包含数据存储、页面路由、业务核验
 */
/**
 * 登录相关功能
 */

// 全局函数：切换登录角色
function switchLoginRole(role) {
    // 移除所有角色的active类
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 添加当前角色的active类
    document.getElementById(`role-${role}`).classList.add('active');
    
    // 显示对应的登录表单
    document.querySelectorAll('.login-form').forEach(form => {
        form.classList.remove('active');
    });
    
    if (role === 'doctor') {
        document.getElementById('doctor-login-form').classList.add('active');
    } else if (role === 'patient') {
        document.getElementById('patient-login-form').classList.add('active');
    }
}

// 全局函数：医生登录
function handleDoctorLogin(event) {
    event.preventDefault();
    
    const account = document.getElementById('doctor-account').value;
    const password = document.getElementById('doctor-password').value;
    
    // 简单验证
    if (account === 'doc01' && password === '123456') {
        app.login('doctor', { id: 'DOC_01', name: '张医生' });
    } else {
        showLoginAlert('账号或密码错误', 'error');
    }
}

// 全局函数：患者登录
function handlePatientLogin(event) {
    event.preventDefault();
    
    const account = document.getElementById('patient-account').value;
    const password = document.getElementById('patient-password').value;
    
    // 在患者数据中查找匹配的患者
    const patient = app.data.patients.find(p => 
        p.account === account && p.password === password
    );
    
    if (patient) {
        app.login('patient', patient);
    } else {
        // 回退兼容：支持演示账号 zhangsan 或 lisi（若本地数据缺失则尝试创建示例患者）
        if ((account === 'zhangsan' || account === 'lisi') && password === '123456') {
            const expectedVisit = account === 'zhangsan' ? 'ABC123' : 'DL100';
            let examplePatient = app.data.patients.find(p => p.account === account) || app.data.patients.find(p => p.visitCode === expectedVisit) || app.data.patients[0];
            if (!examplePatient) {
                // 如果 localStorage 中没有任何患者（或未包含示例），则创建一个示例患者以便演示登录
                const newPatient = {
                    id: Date.now().toString(),
                    name: account === 'lisi' ? '李四' : 'Zhang San',
                    age: 30,
                    visitCode: expectedVisit,
                    status: 'Waiting',
                    account: account,
                    password: '123456'
                };
                app.data.patients.push(newPatient);
                app.saveData();
                examplePatient = newPatient;
            }
            app.login('patient', examplePatient);
            return;
        }
        showLoginAlert('账号或密码错误', 'error');
    }
}

// 显示登录提示
function showLoginAlert(message, type) {
    const alertElement = document.getElementById('login-alert');
    alertElement.textContent = message;
    alertElement.className = `alert ${type}`;
    alertElement.style.display = 'block';
    
    // 3秒后自动隐藏
    setTimeout(() => {
        alertElement.style.display = 'none';
    }, 3000);
}

// 在App类中添加登录方法
/* Removed duplicate earlier App class — its login and patient-specific methods
   are injected into the main App class below to avoid duplicate declaration */

// 模拟数据库结构与初始数据
const INITIAL_DATA = {
     patients: [
        {
            id: '1',
            name: 'Zhang San',
            age: 35,
            visitCode: 'ABC123',
            status: 'Completed',
            account: 'zhangsan',
            password: '123456'
        },
        {
            id: '2',
            name: 'Li Si',
            age: 45,
            visitCode: 'DEF456',
            status: 'Completed',
            account: 'lisi',
            password: '123456'
        },
        {
            id: '3',
            name: 'Wang Wu',
            age: 28,
            visitCode: 'GHI789',
            status: 'Completed',
            account: 'wangwu',
            password: '123456'
        }
        ,
        {
            id: '4',
            name: '李四',
            age: 32,
            visitCode: 'DL100',
            status: 'Waiting',
            account: 'lisi',
            password: '123456'
        }
    ],
    tasks: [
        {
            id: 'T1001',
            patientId: '1',
            type: 'PRESCRIPTION',
            desc_key: 'task_default_PRESCRIPTION',
            status: 'COMPLETED',
            result: 'Prescribed cold medicine, 3x daily, 1 sachet per dose',
            completedBy: 'Dr. Zhang',
            completedAt: '2024-01-15 09:30:00'
        },
        {
            id: 'T1002',
            patientId: '1',
            type: 'IMAGING',
            desc_key: 'task_default_IMAGING',
            status: 'COMPLETED',
            result: 'Chest CT clear, no obvious abnormalities',
            completedBy: 'Technician Li',
            completedAt: '2024-01-15 10:15:00'
        },
        {
            id: 'T2001',
            patientId: '2',
            type: 'PRESCRIPTION',
            desc_key: 'task_default_PRESCRIPTION',
            status: 'COMPLETED',
            result: 'Prescribed antihypertensive, once daily',
            completedBy: 'Dr. Zhang',
            completedAt: '2024-01-15 14:20:00'
        },
        {
            id: 'T2002',
            patientId: '2',
            type: 'THERAPY',
            desc_key: 'task_default_THERAPY',
            status: 'COMPLETED',
            result: 'Completed traction therapy, symptoms improved',
            completedBy: 'Therapist Wang',
            completedAt: '2024-01-15 15:30:00'
        },
        {
            id: 'T3001',
            patientId: '3',
            type: 'PRESCRIPTION',
            desc_key: 'task_default_PRESCRIPTION',
            status: 'COMPLETED',
            result: 'Prescribed gastric meds, twice daily before meals',
            completedBy: 'Dr. Zhang',
            completedAt: '2024-01-15 11:00:00'
        },
        {
            id: 'T3002',
            patientId: '3',
            type: 'IMAGING',
            desc_key: 'task_default_IMAGING',
            status: 'COMPLETED',
            result: 'Mild gastric wall thickening, otherwise unremarkable',
            completedBy: 'Technician Li',
            completedAt: '2024-01-15 11:45:00'
        }
    ],
    logs: [
        {
            time: '2024-01-15 09:30:00',
            msg_key: 'log_task_completed',
            params: { task: 'task_label_PRESCRIPTION', patient: 'Zhang San' }
        },
        {
            time: '2024-01-15 10:15:00',
            msg_key: 'log_task_completed',
            params: { task: 'task_label_IMAGING', patient: 'Zhang San' }
        },
        {
            time: '2024-01-15 14:20:00',
            msg_key: 'log_task_completed',
            params: { task: 'task_label_PRESCRIPTION', patient: 'Li Si' }
        },
        {
            time: '2024-01-15 15:30:00',
            msg_key: 'log_task_completed',
            params: { task: 'task_label_THERAPY', patient: 'Li Si' }
        },
        {
            time: '2024-01-15 11:00:00',
            msg_key: 'log_task_completed',
            params: { task: 'task_label_PRESCRIPTION', patient: 'Wang Wu' }
        },
        {
            time: '2024-01-15 11:45:00',
            msg_key: 'log_task_completed',
            params: { task: 'task_label_IMAGING', patient: 'Wang Wu' }
        }
    ]
};

// Operators (mocked auth config)
const OPERATORS = {
    'DOC_01': { name: 'Dr. Zhang', role: 'DOCTOR', allowedLoc: 'DOC_OFFICE', pin: '1234' },
    'PHY_01': { name: 'Therapist Wang', role: 'THERAPIST', allowedLoc: 'PHYSIO_ROOM', pin: '1234' },
    
};

// Task types and required locations
const TASK_CONFIG = {
    'PRESCRIPTION': { requiredLoc: 'DOC_OFFICE' },
    'IMAGING': { requiredLoc: 'IMG_CENTER' },
    'THERAPY': { requiredLoc: 'PHYSIO_ROOM' }
};

// 真实定位点定义（基于上海地区医院相关位置）
// 经纬度使用WGS84坐标系，radius单位为米
const LOCATIONS = {
    'DOC_OFFICE': { 
        lat: 31.2204, 
        lon: 121.4476, 
        radius: 100,  // 医生办公室 - 瑞金医院附近
        name: '医生办公室',
        address: '上海市黄浦区瑞金二路197号'
    },
    'IMG_CENTER': { 
        lat: 31.2216, 
        lon: 121.4493, 
        radius: 150,  // 影像中心 - 瑞金医院影像楼
        name: '影像中心',
        address: '上海市黄浦区瑞金二路197号影像楼'
    },
    'PHYSIO_ROOM': { 
        lat: 31.2192, 
        lon: 121.4458, 
        radius: 100,  // 物理治疗室 - 瑞金医院康复楼
        name: '物理治疗室',
        address: '上海市黄浦区瑞金二路197号康复楼'
    },
    'REGISTRATION': {
        lat: 31.2198,
        lon: 121.4465,
        radius: 80,   // 挂号处 - 瑞金医院门诊楼
        name: '挂号处',
        address: '上海市黄浦区瑞金二路197号门诊楼'
    },
    'PHARMACY': {
        lat: 31.2209,
        lon: 121.4481,
        radius: 60,   // 药房 - 瑞金医院药房
        name: '药房',
        address: '上海市黄浦区瑞金二路197号药房'
    },
    'LABORATORY': {
        lat: 31.2210,
        lon: 121.4470,
        radius: 70,   // 检验科 - 瑞金医院检验科
        name: '检验科',
        address: '上海市黄浦区瑞金二路197号检验科'
    }
};

// Translations
const TRANSLATIONS = {
    en: {
        nav_dashboard: '📊 Dashboard',
        nav_patients: '👥 Patients',
        nav_tasks: '📋 Tasks',
        data_source: 'Data Source: LocalStorage',
        reset: '[Reset]',
        export_json: '[Export JSON]',
        overview: 'Overview',
        todays_patients: "Today's Patients",
        pending_tasks: 'Pending Tasks',
        completed_treatments: 'Completed Treatments',
        recent_activity: 'Recent Activity',
        patient_registration: 'Patient Registration',
        add_patient: '+ Add Patient',
        search_placeholder: '🔍 Search by name or visit code...',
        th_id: 'ID', th_name: 'Name', th_visit: 'Visit Code (for verification)', th_status: 'Status', th_actions: 'Actions',
        task_board: 'Task Board',
        task_label_PRESCRIPTION: '💊 Prescription',
        task_label_IMAGING: '🩻 Imaging',
        task_label_THERAPY: '💆 Therapy',
        task_default_PRESCRIPTION: 'Prescription: pending doctor',
        task_default_IMAGING: 'Imaging: pending exam',
        task_default_THERAPY: 'Therapy: scheduled',
        step_task_info: '1. Task Info',
        step_result_input: '2. Result Input',
        step_auth_check: '3. Authenticity Check (AI Logic)',
        filter_all: 'All', filter_prescription: '💊 Prescription', filter_imaging: '🩻 Imaging', filter_therapy: '💆 Therapy',
        add_patient_title: 'Add Patient',
        cancel: 'Cancel', register: 'Register', save: 'Save',
        verify_title: '🔐 Treatment Verification & Entry',
        verify_subtitle: 'Please ensure the patient is present and verify identity',
        location_default: '-- Select current location --',
        loc_doc: 'Doctor Office (Prescription)', loc_img: 'Imaging Center (CT/X-ray)', loc_phy: 'Physio Room',
        patient_visit_code: "Enter the patient's 6-char code",
        operator_id: 'Operator ID', security_pin: 'Security PIN', verify_submit: 'Verify & Submit',
        patient_full_record: '📂 Patient Full Record', patient_name: 'Patient Name', visit_code: 'Visit Code', current_status: 'Current Status',
        age: 'Age',
        current_location: 'Current Location',
        edit_patient: '✏️ Edit Patient', visit_code_readonly: 'Visit Code (read-only)',
        digital_card_title: 'aiCaseManage', digital_card_sub: 'Digital Health Pass', show_code: 'Please show this code to staff',
        card_name: 'Name:', card_status: 'Status:', close: 'Close',
        patient_prefix: 'Patient:', result_label: 'Result:', performed_by: 'Performed by:',
        no_tasks: 'No tasks', no_matching_patients: 'No matching patients', no_treatment_records: 'No treatment records',
        details: 'Details', new_visit: 'New Visit', delete_label: 'Delete',
        confirm_reset: '⚠️ Are you sure you want to clear all data? This cannot be undone!',
        confirm_delete_patient: '⚠️ Warning: deleting a patient will remove all related records. Continue?',
        log_new_patient: 'New patient registered: {name} (code:{code})',
        log_task_completed: 'Task completed: {task} - {patient}',
        log_update_patient: 'Updated patient: {name}',
        log_delete_patient: 'Admin deleted patient (ID: {id})',
        confirm_start_new_visit: 'Confirm to start a new visit for {name}? This will reset status and create a new prescription task.',
        start_new_visit_alert: '✅ New visit started; task created.',
        task_desc_initial: 'Initial prescription: pending doctor',
        task_desc_revisit: 'Revisit: waiting for prescription',
        auto_imaging: '✅ Prescription issued. Imaging task auto-dispatched.',
        auto_therapy: '✅ Prescription issued. Therapy task auto-dispatched.',
        task_completed_alert: '✅ Task completed and archived!',
        status_completed: 'Completed', status_inprogress: 'In Progress', note: 'Note:',
        status_waiting: 'Waiting', status_in_treatment: 'In Treatment',
        err_pin_incorrect: '❌ Operator PIN incorrect!',
        err_visit_code_mismatch: "❌ Patient visit code does not match! Please verify the patient's identity.",
        err_location_template: '❌ Location error! This task must be performed at {required}, current: {current}',
        err_permission_template: '❌ Permission denied! Operator {name} is not authorized to perform tasks at {required}.',
        role_doctor: 'Doctor', role_therapist: 'Therapist', role_technician: 'Technician',
        result_placeholder: 'Enter diagnosis, imaging report or therapy feedback...',
        unknown: 'Unknown',
    },
    zh: {
        nav_dashboard: '📊 仪表盘',
        nav_patients: '👥 患者管理',
        nav_tasks: '📋 诊疗任务',
        data_source: '数据源: LocalStorage',
        reset: '[重置]',
        export_json: '[导出JSON]',
        overview: '全流程概览',
        todays_patients: '今日患者',
        pending_tasks: '待办任务',
        completed_treatments: '已完成诊疗',
        recent_activity: '最近动态',
        patient_registration: '患者登记',
        add_patient: '+ 新增患者',
        search_placeholder: '🔍 输入患者姓名或就诊码进行检索...',
        th_id: 'ID', th_name: '姓名', th_visit: '就诊码 (核验用)', th_status: '当前状态', th_actions: '操作',
        task_board: '诊疗任务执行台',
        task_label_PRESCRIPTION: '💊 处方',
        task_label_IMAGING: '🩻 影像检查',
        task_label_THERAPY: '💆 物理治疗',
        task_default_PRESCRIPTION: '处方：待医生开具',
        task_default_IMAGING: '影像：待检查',
        task_default_THERAPY: '理疗：已安排',
        step_task_info: '1. 任务信息',
        step_result_input: '2. 结果录入',
        step_auth_check: '3. 真伪核验 (AI 逻辑)',
        filter_all: '全部', filter_prescription: '💊 处方', filter_imaging: '🩻 影像检查', filter_therapy: '💆 理疗',
        add_patient_title: '新增患者',
        cancel: '取消', register: '登记', save: '保存',
        verify_title: '🔐 诊疗行为核验与录入',
        verify_subtitle: '请确保患者在场并核对身份',
        location_default: '-- 请选择当前位置 --',
        loc_doc: '医生诊室 (开处方)', loc_img: '影像中心 (CT/X光)', loc_phy: '理疗康复室',
        patient_visit_code: '输入患者持有的6位代码',
        operator_id: '操作员 ID', security_pin: '安全 PIN 码', verify_submit: '核验并提交',
        patient_full_record: '📂 患者全流程病历', patient_name: '患者姓名', visit_code: '就诊码', current_status: '当前状态',
        age: '年龄',
        current_location: '当前位置',
        edit_patient: '✏️ 编辑患者', visit_code_readonly: '就诊码 (不可修)',
        digital_card_title: 'aiCaseManage', digital_card_sub: '电子健康凭证', show_code: '请向医生出示此码',
        card_name: '姓名:', card_status: '状态:', close: '关闭屏幕',
        patient_prefix: '患者:', result_label: '结果:', performed_by: '执行人:',
        no_tasks: '暂无相关任务', no_matching_patients: '暂无匹配患者', no_treatment_records: '暂无诊疗记录',
        details: '详情', new_visit: '复诊', delete_label: '删除',
        confirm_reset: '⚠️ 确定要清空所有数据吗？此操作不可恢复！',
        confirm_delete_patient: '⚠️ 警告：删除患者将同步清空其所有诊疗记录！确定要删除吗？',
        log_new_patient: '新患者登记: {name} (码:{code})',
        log_task_completed: '任务完成: {task} - {patient}',
        log_update_patient: '更新了患者信息: {name}',
        log_delete_patient: '管理员删除了患者 (ID: {id})',
        confirm_start_new_visit: '确认要为 {name} 开启新的复诊流程吗？\n这将重置其状态并生成新处方任务。',
        start_new_visit_alert: '✅ 复诊成功！已生成新任务。',
        task_desc_initial: '待医生开具处方',
        task_desc_revisit: '复诊：待医生开具处方',
        auto_imaging: '✅ 处方已开具，系统自动派发：影像检查任务',
        auto_therapy: '✅ 处方已开具，系统自动派发：理疗任务',
        task_completed_alert: '✅ 诊疗项目已完成并归档！',
        status_completed: '已完成', status_inprogress: '进行中', note: '说明:',
        status_waiting: '待诊', status_in_treatment: '诊疗中',
        err_pin_incorrect: '❌ 操作员 PIN 码错误！',
        err_visit_code_mismatch: '❌ 患者就诊码不匹配！请核对患者身份。',
        err_location_template: '❌ 地点错误！该任务必须在 {required} 执行，当前: {current}',
        err_permission_template: '❌ 权限不足！操作员 {name} 无权在 {required} 执行此项操作。',
        role_doctor: '医生', role_therapist: '理疗师', role_technician: '影像技师',
        result_placeholder: '请输入诊断、影像报告或治疗反馈...',
        unknown: '未知',
    }
};

class App {
    constructor() {
        this.data = this.loadData();
        this.lang = localStorage.getItem('aiCaseManage_lang') || 'en';
        this.currentUser = null;
        this.userRole = null;
        this.currentPatientId = null; // 当前登录的患者ID
        this.currentDetectedLocation = null; // {lat,lon,nearest,distance}
        this.locationStatus = 'idle'; // 'idle', 'detecting', 'success', 'error'
        this.init();
        // apply translations after initial render
        this.applyTranslations();

        // 检查是否已登录
        this.checkLogin();
    }

    // 更新定位UI的辅助方法
    _updateLocationUI(status, message) {
        const el = document.getElementById('detected-location');
        if (el) {
            el.innerText = message;
            // 根据状态设置不同的样式
            el.className = '';
            if (status === 'detecting') {
                el.style.color = '#2196F3'; // 蓝色表示正在定位
            } else if (status === 'success') {
                el.style.color = '#4CAF50'; // 绿色表示成功
            } else if (status === 'error') {
                el.style.color = '#f44336'; // 红色表示错误
            } else {
                el.style.color = ''; // 默认颜色
            }
        }
    }

    // 设置目标位置的坐标值（保留以兼容快捷按钮）
    setTargetLocation(lat, lon, radius) {
        document.getElementById('manual-lat').value = lat;
        document.getElementById('manual-lon').value = lon;
        document.getElementById('manual-accuracy').value = radius;

        // 如果已经获取了GPS位置，立即检查匹配
        if (this.currentGPSLocation) {
            this.checkLocationMatch();
        }
    }

    // 选择目标位置
    selectTargetLocation(locationKey) {
        // 定义目标位置信息
        const locationInfo = {
            'DOC_OFFICE': {
                name: '诊室 (开处方)',
                lat: 31.2204,
                lon: 121.4476,
                radius: 100
            },
            'IMG_CENTER': {
                name: '影像中心 (检查)',
                lat: 31.2216,
                lon: 121.4493,
                radius: 150
            },
            'PHYSIO_ROOM': {
                name: '理疗中心 (治疗)',
                lat: 31.2192,
                lon: 121.4458,
                radius: 100
            }
        };

        const target = locationInfo[locationKey];
        if (!target) {
            alert(this.lang === 'zh' ? '无效的位置选择' : 'Invalid location selection');
            return;
        }

        // 保存选中的目标位置
        this.selectedTargetLocation = {
            key: locationKey,
            name: target.name,
            lat: target.lat,
            lon: target.lon,
            radius: target.radius
        };

        // 自动填充经纬度和范围
        document.getElementById('manual-lat').value = target.lat;
        document.getElementById('manual-lon').value = target.lon;
        document.getElementById('manual-accuracy').value = target.radius;

        // 更新UI显示选中的位置
        document.getElementById('selected-target-name').textContent = target.name;

        // 如果已经获取了GPS位置，立即检查匹配
        if (this.currentGPSLocation) {
            this.checkLocationMatch();
        }

        console.log('=== 选择目标位置 ===');
        console.log('位置:', target.name);
        console.log('坐标:', target.lat, target.lon);
        console.log('范围:', target.radius, '米');
        console.log('==================');
    }

    // 刷新位置匹配检查
    refreshLocationMatch() {
        if (this.currentGPSLocation) {
            this.checkLocationMatch();
        } else {
            alert(this.lang === 'zh' ? '请先点击Locate按钮获取GPS位置' : 'Please click Locate button to get GPS position first');
        }
    }

    // 检查当前位置是否匹配目标位置
    checkLocationMatch() {
        if (!this.currentGPSLocation) {
            return null;
        }

        const currentLat = this.currentGPSLocation.lat;
        const currentLon = this.currentGPSLocation.lon;

        // 如果没有选择目标位置，显示所有位置的匹配结果
        if (!this.selectedTargetLocation) {
            return this.checkAllLocations(currentLat, currentLon);
        }

        // 只检查选中的目标位置
        const target = this.selectedTargetLocation;
        const distance = this._haversineDistance(currentLat, currentLon, target.lat, target.lon);
        const isMatch = distance <= target.radius;
        const accuracy = Math.random() * 20 + 5;  // 随机生成5-25米的精度

        // 更新UI显示
        const detectedLocationEl = document.getElementById('detected-location');
        const color = isMatch ? '#059669' : '#dc2626';
        const status = isMatch ? '✓ 匹配' : '✗ 不匹配';
        const matchDetail = isMatch ? '' : ` (超出${(distance - target.radius).toFixed(1)}米)`;

        detectedLocationEl.innerHTML = `
            <div style="font-size:12px;">
                <div style="margin-bottom:4px; font-weight:600;">位置匹配结果:</div>
                <div style="color:${color}; margin:2px 0;">
                    ${status} ${target.name}<br/>
                    距离: ${distance.toFixed(1)}米${matchDetail}<br/>
                    精度: ${accuracy.toFixed(1)}米
                </div>
            </div>
        `;

        console.log('=== 位置匹配检查 ===');
        console.log('当前位置:', currentLat, currentLon);
        console.log('目标位置:', target.name);
        console.log('目标坐标:', target.lat, target.lon);
        console.log('目标范围:', target.radius, '米');
        console.log('实际距离:', distance.toFixed(1), '米');
        console.log('匹配状态:', isMatch ? '匹配' : '不匹配');
        console.log('定位精度:', accuracy.toFixed(1), '米');
        console.log('==================');

        return {
            key: target.key,
            name: target.name,
            distance: distance,
            isMatch: isMatch,
            accuracy: accuracy
        };
    }

    // 检查所有位置的匹配结果
    checkAllLocations(currentLat, currentLon) {
        // 定义三个目标位置及其范围
        const targetLocations = {
            'DOC_OFFICE': {
                name: '诊室 (开处方)',
                lat: 31.2204,
                lon: 121.4476,
                radius: 100
            },
            'IMG_CENTER': {
                name: '影像中心 (检查)',
                lat: 31.2216,
                lon: 121.4493,
                radius: 150
            },
            'PHYSIO_ROOM': {
                name: '理疗中心 (治疗)',
                lat: 31.2192,
                lon: 121.4458,
                radius: 100
            }
        };

        // 计算与每个目标位置的距离
        const results = {};
        Object.keys(targetLocations).forEach(key => {
            const target = targetLocations[key];
            const distance = this._haversineDistance(currentLat, currentLon, target.lat, target.lon);
            const isMatch = distance <= target.radius;
            results[key] = {
                name: target.name,
                distance: distance,
                isMatch: isMatch,
                accuracy: Math.random() * 20 + 5  // 随机生成5-25米的精度
            };
        });

        // 更新UI显示
        const detectedLocationEl = document.getElementById('detected-location');
        let html = '<div style="font-size:12px;">';
        html += '<div style="margin-bottom:4px; font-weight:600;">位置匹配结果:</div>';

        Object.keys(results).forEach(key => {
            const result = results[key];
            const color = result.isMatch ? '#059669' : '#dc2626';
            const status = result.isMatch ? '✓ 匹配' : '✗ 不匹配';
            html += `<div style="color:${color}; margin:2px 0;">${status} ${result.name}: 距离${result.distance.toFixed(1)}米, 精度${result.accuracy.toFixed(1)}米</div>`;
        });
        html += '</div>';
        detectedLocationEl.innerHTML = html;

        console.log('=== 位置匹配检查 ===');
        console.log('当前位置:', currentLat, currentLon);
        Object.keys(results).forEach(key => {
            const result = results[key];
            console.log(`${result.name}: 距离${result.distance.toFixed(1)}米, ${result.isMatch ? '匹配' : '不匹配'}, 精度${result.accuracy.toFixed(1)}米`);
        });
        console.log('==================');

        return results;
    }

    // 使用手动输入的坐标进行定位
    useManualLocation() {
        const latInput = document.getElementById('manual-lat');
        const lonInput = document.getElementById('manual-lon');
        const accuracyInput = document.getElementById('manual-accuracy');

        const lat = parseFloat(latInput.value);
        const lon = parseFloat(lonInput.value);
        const accuracy = parseFloat(accuracyInput.value) || 10;

        // 验证输入
        if (isNaN(lat) || isNaN(lon)) {
            alert(this.lang === 'zh' 
                ? '请输入有效的经纬度！' 
                : 'Please enter valid coordinates!');
            return;
        }

        // 验证经纬度范围
        // 验证经纬度范围
        if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            const msg = this.lang === 'zh'
                ? '经纬度超出有效范围！\n纬度范围：-90 到 90\n经度范围：-180 到 180'
                : 'Coordinates out of valid range!\nLatitude: -90 to 90\nLongitude: -180 to 180';
            alert(msg);
            return;
        }

        console.log('=== 手动输入坐标 ===');
        console.log('纬度:', lat);
        console.log('经度:', lon);
        console.log('精度:', accuracy, '米');

        // 更新状态为正在定位
        this.locationStatus = 'detecting';
        this._updateLocationUI('detecting', this.lang === 'zh' ? '正在定位中...' : 'Locating...');

        // 使用Geolocation API获取当前位置
        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const currentLat = position.coords.latitude;
                const currentLon = position.coords.longitude;

                // 保存GPS位置
                this.currentGPSLocation = {
                    lat: currentLat,
                    lon: currentLon,
                    accuracy: position.coords.accuracy
                };

                console.log('=== GPS定位成功 ===');
                console.log('当前位置纬度:', currentLat);
                console.log('当前位置经度:', currentLon);
                console.log('GPS精度:', position.coords.accuracy, '米');
                console.log('==================');

                // 计算与目标位置的距离
                const distance = this._haversineDistance(currentLat, currentLon, lat, lon);
                const isMatch = distance <= accuracy;

                // 查找匹配的下拉框位置
                let matchedLocation = null;
                Object.keys(LOCATIONS).forEach(k => {
                    const loc = LOCATIONS[k];
                    if (Math.abs(loc.lat - lat) < 0.0001 && Math.abs(loc.lon - lon) < 0.0001) {
                        matchedLocation = k;
                    }
                });

                // 更新UI显示
                const detectedLocationEl = document.getElementById('detected-location');
                const color = isMatch ? '#059669' : '#dc2626';
                const status = isMatch ? '✓ 匹配' : '✗ 不匹配';
                const matchDetail = isMatch ? '' : ` (超出${(distance - accuracy).toFixed(1)}米)`;
                const locationName = matchedLocation ? LOCATIONS[matchedLocation].name : '目标位置';

                detectedLocationEl.innerHTML = `
                    <div style="font-size:12px;">
                        <div style="margin-bottom:4px; font-weight:600;">位置匹配结果:</div>
                        <div style="color:${color}; margin:2px 0;">
                            ${status} ${locationName}<br/>
                            距离: ${distance.toFixed(1)}米${matchDetail}<br/>
                            精度: ${accuracy.toFixed(1)}米
                        </div>
                    </div>
                `;

                // 自动选择匹配的位置
                const locSelect = document.querySelector('#modal-verify select[name="location"]');
                if (locSelect && matchedLocation) {
                    locSelect.value = matchedLocation;
                }

                console.log('=== 位置匹配结果 ===');
                console.log('目标位置:', locationName);
                console.log('实际距离:', distance.toFixed(1), '米');
                console.log('匹配状态:', isMatch ? '匹配' : '不匹配');
                console.log('==================');
            },
            (error) => {
                let errorMsg = '';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMsg = this.lang === 'zh' ? '用户拒绝了定位请求' : 'User denied the request for Geolocation';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMsg = this.lang === 'zh' ? '位置信息不可用' : 'Location information is unavailable';
                        break;
                    case error.TIMEOUT:
                        errorMsg = this.lang === 'zh' ? '定位请求超时' : 'The request to get user location timed out';
                        break;
                    default:
                        errorMsg = this.lang === 'zh' ? '定位发生未知错误' : 'An unknown error occurred';
                        break;
                }
                this.locationStatus = 'error';
                this._updateLocationUI('error', errorMsg);
            },
            options
        );

    }
    //     this.currentDetectedLocation = { 
    //         lat, 
    //         lon, 
    //         nearest, 
    //         distance: minDist,
    //         accuracy: accuracy
    //     };
    //     this.locationStatus = 'success';

    //     // 更新UI显示
    //     const locationName = nearest ? (LOCATIONS[nearest].name || nearest) : (this.lang === 'zh' ? '未知位置' : 'Unknown location');
    //     const distText = minDist < Infinity ? `${minDist.toFixed(1)}m` : 'N/A';
    //     const accuracyText = this.lang === 'zh' ? `精度: ${accuracy}米` : `Accuracy: ${accuracy}m`;
    //     this._updateLocationUI('success', `${this.lang === 'zh' ? '检测到' : 'Detected'}: ${locationName} (${this.lang === 'zh' ? '距离' : 'dist'}: ${distText}, ${accuracyText})`);

    //     // 自动选择检测到的最近位置
    //     const locSelect = document.querySelector('#modal-verify select[name="location"]');
    //     if (locSelect && nearest) {
    //         locSelect.value = nearest;
    //     }
    // }

    // 使用模拟定位获取位置（真实定位代码已注释）
    detectLocation() {
        console.log('detectLocation called');
        // 更新状态为正在定位
        this.locationStatus = 'detecting';
        this._updateLocationUI('detecting', this.lang === 'zh' ? '正在定位中...' : 'Locating...');

        // 模拟定位延迟
        // setTimeout(() => {
        //     console.log('setTimeout callback executed');

        //     // 获取当前任务ID
        //     const taskIdInput = document.getElementById('verify-task-id');
        //     if (!taskIdInput || !taskIdInput.value) {
        //         this._updateLocationUI('error', this.lang === 'zh' ? '请先选择一个任务' : 'Please select a task first');
        //         return;
        //     }

        //     const taskId = taskIdInput.value;
        //     const task = this.data.tasks.find(t => t.id === taskId);

        //     if (!task || !TASK_CONFIG[task.type]) {
        //         this._updateLocationUI('error', this.lang === 'zh' ? '无效的任务类型' : 'Invalid task type');
        //         return;
        //     }

        //     // 获取任务要求的位置
        //     const requiredLocation = TASK_CONFIG[task.type].requiredLoc;
        //     console.log('Task type:', task.type, 'Required location:', requiredLocation);

        //     // 随机决定是否匹配位置（30%概率不匹配）
        //     const shouldMismatch = Math.random() < 0.3;
        //     console.log('Should mismatch:', shouldMismatch);

        //     let detectedLocation;
        //     if (shouldMismatch) {
        //         // 随机选择一个不匹配的位置
        //         const locationKeys = Object.keys(LOCATIONS).filter(loc => loc !== requiredLocation);
        //         detectedLocation = locationKeys[Math.floor(Math.random() * locationKeys.length)];
        //         console.log('Mismatched location:', detectedLocation);
        //     } else {
        //         // 使用任务要求的位置
        //         detectedLocation = requiredLocation;
        //         console.log('Matched location:', detectedLocation);
        //     }

        //     // 获取该位置的坐标
        //     const { lat, lon } = LOCATIONS[detectedLocation];
        //     console.log('Location coordinates:', { lat, lon });

        //     // 添加一些随机偏移，模拟定位误差
        //     const offsetLat = (Math.random() - 0.5) * 0.0001;
        //     const offsetLon = (Math.random() - 0.5) * 0.0001;

        //     // 计算模拟距离（在10-30米之间）
        //     const simulatedDistance = 10 + Math.random() * 20;

        //     // 更新当前位置信息
        //     this.currentDetectedLocation = {
        //         lat: lat + offsetLat,
        //         lon: lon + offsetLon,
        //         nearest: detectedLocation,
        //         distance: simulatedDistance
        //     };

        //     // 更新UI显示
        //     const locationName = LOCATIONS[detectedLocation].name;
        //     const distText = simulatedDistance.toFixed(1) + 'm';

        //     // 检查位置是否匹配
        //     if (detectedLocation !== requiredLocation) {
        //         // 位置不匹配，显示红色错误提示
        //         const errorMsg = this.lang === 'zh'
        //             ? `❌ 位置错误：您当前在${locationName}，但任务要求在${LOCATIONS[requiredLocation].name}`
        //             : `❌ Location Error: You are at ${locationName}, but task requires ${LOCATIONS[requiredLocation].name}`;
        //         this._updateLocationUI('error', errorMsg);

        //         // 自动选择检测到的位置
        //         const locSelect = document.querySelector('#modal-verify select[name="location"]');
        //         if (locSelect) {
        //             locSelect.value = detectedLocation;

        //             // 显示红色错误提示
        //             const errorEl = document.createElement('div');
        //             errorEl.style.cssText = 'color: #dc2626; font-size: 13px; margin-top: 8px; padding: 10px; background: #fee2e2; border: 1px solid #fecaca; border-radius: 4px;';
        //             errorEl.id = 'location-error';
        //             errorEl.innerHTML = errorMsg;

        //             // 移除旧的错误提示
        //             const oldError = document.getElementById('location-error');
        //             if (oldError) {
        //                 oldError.remove();
        //             }

        //             // 添加新的错误提示
        //             const locationDiv = document.getElementById('detected-location').parentNode;
        //             locationDiv.appendChild(errorEl);
        //         }
        //     } else {
        //         // 位置匹配，显示成功信息
        //         this._updateLocationUI('success', `${this.lang === 'zh' ? '检测到' : 'Detected'}: ${locationName} (${this.lang === 'zh' ? '距离' : 'dist'}: ${distText})`);

        //         // 自动选择检测到的最近位置
        //         const locSelect = document.querySelector('#modal-verify select[name="location"]');
        //         if (locSelect) {
        //             locSelect.value = detectedLocation;

        //             // 移除错误提示
        //             const oldError = document.getElementById('location-error');
        //             if (oldError) {
        //                 oldError.remove();
        //             }
        //         }
        //     }
        // }, 1000);  // 模拟1秒的定位延迟

        // 以下是真实定位代码（已注释）
        
        // 使用Geolocation API获取位置
        const options = {
            enableHighAccuracy: true,  // 请求高精度定位
            timeout: 10000,            // 10秒超时
            maximumAge: 0              // 不使用缓存的位置
        };

        navigator.geolocation.getCurrentPosition(
            // 成功回调
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                // 保存GPS位置
                this.currentGPSLocation = {
                    lat: lat,
                    lon: lon,
                    accuracy: position.coords.accuracy
                };

                console.log('=== GPS定位成功 ===');
                console.log('纬度:', lat);
                console.log('经度:', lon);
                console.log('精度:', position.coords.accuracy, '米');
                console.log('==================');

                // 计算与每个已知地点的距离（使用Haversine公式）
                let nearest = null;
                let minDist = Infinity;
                Object.keys(LOCATIONS).forEach(k => {
                    const d = this._haversineDistance(lat, lon, LOCATIONS[k].lat, LOCATIONS[k].lon);
                    if (d < minDist) { 
                        minDist = d; 
                        nearest = k; 
                    }
                });

                // 更新当前位置信息
                this.currentDetectedLocation = { lat, lon, nearest, distance: minDist };
                this.locationStatus = 'success';

                // 更新UI显示
                const locationName = nearest ? (LOCATIONS[nearest].name || nearest) : (this.lang === 'zh' ? '未知位置' : 'Unknown location');
                const distText = minDist < Infinity ? `${minDist.toFixed(1)}m` : 'N/A';
                this._updateLocationUI('success', `${this.lang === 'zh' ? 'GPS位置' : 'GPS Location'}: ${lat.toFixed(6)}, ${lon.toFixed(6)} (${this.lang === 'zh' ? '最近' : 'Nearest'}: ${locationName}, ${distText})`);

                // 自动选择检测到的最近位置
                const locSelect = document.querySelector('#modal-verify select[name="location"]');
                if (locSelect && nearest) {
                    locSelect.value = nearest;
                }

                // 检查是否匹配目标位置
                this.checkLocationMatch();
            },
            // 错误回调
            (error) => {
                let errorMsg = '';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMsg = this.lang === 'zh' ? '用户拒绝了定位请求' : 'User denied the request for Geolocation';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMsg = this.lang === 'zh' ? '位置信息不可用' : 'Location information is unavailable';
                        break;
                    case error.TIMEOUT:
                        errorMsg = this.lang === 'zh' ? '定位请求超时' : 'The request to get user location timed out';
                        break;
                    default:
                        errorMsg = this.lang === 'zh' ? '定位发生未知错误' : 'An unknown error occurred';
                        break;
                }
                this.locationStatus = 'error';
                this._updateLocationUI('error', errorMsg);
            },
            options
        );
        
    }

    // 使用Haversine公式计算两点间的实际地理距离（单位：米）
    _haversineDistance(lat1, lon1, lat2, lon2) {
        // 地球半径，单位为米
        const R = 6371000;

        // 将经纬度从度数转换为弧度
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        // Haversine公式
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        // 返回距离（米）
        return R * c;
    }

    // 保留简单欧氏距离方法作为备用
    _dist(lat1, lon1, lat2, lon2) {
        return this._haversineDistance(lat1, lon1, lat2, lon2);
    }

    // --- 会话与登录管理（添加以确保实例可用） ---
    checkLogin() {
        const savedUser = localStorage.getItem('aiCaseManage_user');
        if (savedUser) {
            try {
                const { role, userData } = JSON.parse(savedUser);
                this.login(role, userData, true);
            } catch (e) {
                // ignore malformed saved user
            }
        }
    }

    login(role, userData, isAutoLogin = false) {
        this.userRole = role;
        this.currentUser = userData;

        if (role === 'patient') this.currentPatientId = userData.id;

        localStorage.setItem('aiCaseManage_user', JSON.stringify({ role, userData }));

        const loginContainer = document.getElementById('login-container');
        const appContainer = document.getElementById('app-container');
        if (loginContainer) loginContainer.style.display = 'none';
        if (appContainer) appContainer.style.display = 'flex';

        this.setupRoleBasedUI();

        if (!isAutoLogin) {
            const who = userData && userData.name ? userData.name : role;
            this.logActivity(`${who} 登录系统`);
        }
    }

    setupRoleBasedUI() {
        if (this.userRole === 'doctor') {
            const navPatients = document.getElementById('nav-patients'); if (navPatients) navPatients.style.display = 'block';
            const navTasks = document.getElementById('nav-tasks'); if (navTasks) navTasks.style.display = 'block';
            const navSelf = document.getElementById('nav-patient-self'); if (navSelf) navSelf.style.display = 'none';
            const btnAdd = document.getElementById('btn-add-patient'); if (btnAdd) btnAdd.style.display = 'block';
            this.navigate('dashboard');
        } else if (this.userRole === 'patient') {
            const navPatients = document.getElementById('nav-patients'); if (navPatients) navPatients.style.display = 'none';
            const navTasks = document.getElementById('nav-tasks'); if (navTasks) navTasks.style.display = 'none';
            const navSelf = document.getElementById('nav-patient-self'); if (navSelf) navSelf.style.display = 'block';
            const btnAdd = document.getElementById('btn-add-patient'); if (btnAdd) btnAdd.style.display = 'none';
            this.navigate('patient-self');
            this.loadPatientSelfInfo();
        }
    }

    loadPatientSelfInfo() {
        if (!this.currentPatientId) return;
        const patient = this.data.patients.find(p => p.id === this.currentPatientId);
        if (!patient) return;
        const nameEl = document.getElementById('self-p-name'); if (nameEl) nameEl.textContent = patient.name;
        const codeEl = document.getElementById('self-p-code'); if (codeEl) codeEl.textContent = patient.visitCode;
        const statusEl = document.getElementById('self-p-status'); if (statusEl) statusEl.textContent = this.getText('status_' + (patient.status || '').replace(/\s+/g, '_').toLowerCase()) || patient.status;
        this.renderPatientSelfTimeline(patient.id);
    }

    renderPatientSelfTimeline(patientId) {
        const timelineContainer = document.getElementById('self-history-timeline');
        if (!timelineContainer) return;
        const patient = this.data.patients.find(p => p.id === patientId);
        if (!patient) {
            timelineContainer.innerHTML = `<li style="color:#999">${this.getText('no_treatment_records') || 'No records'}</li>`;
            return;
        }
        const tasks = this.data.tasks.filter(t => t.patientId === patientId).sort((a,b)=>a.id.localeCompare(b.id));
        if (tasks.length === 0) {
            timelineContainer.innerHTML = `<li style="color:#999">${this.getText('no_treatment_records') || 'No records'}</li>`;
            return;
        }
        timelineContainer.innerHTML = tasks.map(t => {
            const isDone = t.status === 'COMPLETED';
            const label = this.getText('task_label_' + t.type) || t.type;
            const descText = this.getText(t.desc_key) || t.desc || '';
            return `
                <li class="timeline-item ${isDone ? 'done' : ''}">
                    <div class="timeline-content">
                        <span class="timeline-time">${isDone ? t.completedAt : this.getText('status_waiting')}</span>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <strong>${label}</strong>
                            <span class="badge ${isDone ? 'badge-completed' : 'badge-pending'}">${isDone ? (this.getText('status_completed') || 'Completed') : (this.getText('status_inprogress') || 'In Progress')}</span>
                        </div>
                        <p style="margin-top:8px; font-size:13px; color:#555;">${isDone ? `🏁 ${this.getText('result_label') || 'Result:'} ${t.result}<br><small>${this.getText('performed_by') || 'Performed by:'} ${t.completedBy}</small>` : `📝 ${this.getText('note') || 'Note:'} ${descText}`}</p>
                    </div>
                </li>
            `;
        }).join('');
    }

    logout() {
        if (!confirm(this.getText('confirm_reset') || 'Confirm logout?')) return;
        localStorage.removeItem('aiCaseManage_user');
        const appContainer = document.getElementById('app-container'); if (appContainer) appContainer.style.display = 'none';
        const loginContainer = document.getElementById('login-container'); if (loginContainer) loginContainer.style.display = 'flex';
        this.currentUser = null; this.userRole = null; this.currentPatientId = null;
        const docForm = document.getElementById('doctor-login-form'); if (docForm) docForm.reset();
        const patForm = document.getElementById('patient-login-form'); if (patForm) patForm.reset();
        switchLoginRole('doctor');
    }

    getText(key, params) {
        const dict = TRANSLATIONS[this.lang] || TRANSLATIONS['en'];
        let str = dict[key] || key;
        if (params) {
            Object.keys(params).forEach(k => {
                str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), params[k]);
            });
        }
        return str;
    }

    setLanguage(lang) {
        this.lang = lang;
        localStorage.setItem('aiCaseManage_lang', lang);
        this.applyTranslations();
        // re-render dynamic lists so translated labels update
        this.renderPatientList();
        this.renderTaskList();
        this.renderDashboard();
    }

    applyTranslations() {
        // Nav
        const navDashboard = document.getElementById('nav-dashboard');
        if (navDashboard) navDashboard.innerText = this.getText('nav_dashboard');
        const navPatients = document.getElementById('nav-patients');
        if (navPatients) navPatients.innerText = this.getText('nav_patients');
        const navTasks = document.getElementById('nav-tasks');
        if (navTasks) navTasks.innerText = this.getText('nav_tasks');

        const ds = document.getElementById('data-source');
        if (ds) ds.innerText = this.getText('data_source');
        const btnReset = document.getElementById('btn-reset');
        if (btnReset) btnReset.innerText = this.getText('reset');
        const btnExport = document.getElementById('btn-export');
        if (btnExport) btnExport.innerText = this.getText('export_json');
        const langSelect = document.getElementById('lang-select');
        if (langSelect) langSelect.value = this.lang;

        // Headings / stats
        const hOverview = document.getElementById('heading-overview'); if (hOverview) hOverview.innerText = this.getText('overview');
        const sPatients = document.getElementById('stat-title-patients'); if (sPatients) sPatients.innerText = this.getText('todays_patients');
        const sPending = document.getElementById('stat-title-pending'); if (sPending) sPending.innerText = this.getText('pending_tasks');
        const sCompleted = document.getElementById('stat-title-completed'); if (sCompleted) sCompleted.innerText = this.getText('completed_treatments');
        const sActivity = document.getElementById('stat-title-activity'); if (sActivity) sActivity.innerText = this.getText('recent_activity');

        // Patients view
        const hPatients = document.getElementById('heading-patients'); if (hPatients) hPatients.innerText = this.getText('patient_registration');
        const btnAdd = document.getElementById('btn-add-patient'); if (btnAdd) btnAdd.innerText = this.getText('add_patient');
        const search = document.getElementById('search-input'); if (search) search.placeholder = this.getText('search_placeholder');
        const thId = document.getElementById('th-id'); if (thId) thId.innerText = this.getText('th_id');
        const thName = document.getElementById('th-name'); if (thName) thName.innerText = this.getText('th_name');
        const thVisit = document.getElementById('th-visit'); if (thVisit) thVisit.innerText = this.getText('th_visit');
        const thStatus = document.getElementById('th-status'); if (thStatus) thStatus.innerText = this.getText('th_status');
        const thActions = document.getElementById('th-actions'); if (thActions) thActions.innerText = this.getText('th_actions');

        // Tasks view
        const hTasks = document.getElementById('heading-tasks'); if (hTasks) hTasks.innerText = this.getText('task_board');
        const fAll = document.getElementById('filter-all'); if (fAll) fAll.innerText = this.getText('filter_all');
        const fPre = document.getElementById('filter-prescription'); if (fPre) fPre.innerText = this.getText('filter_prescription');
        const fImg = document.getElementById('filter-imaging'); if (fImg) fImg.innerText = this.getText('filter_imaging');
        const fThy = document.getElementById('filter-therapy'); if (fThy) fThy.innerText = this.getText('filter_therapy');

        // Modals: titles and placeholders
        const addModalTitle = document.querySelector('#modal-add-patient .modal-content h3'); if (addModalTitle) addModalTitle.innerText = this.getText('add_patient_title');
        const verifyTitle = document.querySelector('#modal-verify .verify-header h3'); if (verifyTitle) verifyTitle.innerText = this.getText('verify_title');
        const verifySub = document.querySelector('#modal-verify .verify-header p'); if (verifySub) verifySub.innerText = this.getText('verify_subtitle');
        const stepTaskInfo = document.getElementById('step-task-info'); if (stepTaskInfo) stepTaskInfo.innerText = this.getText('step_task_info');
        const stepResultInput = document.getElementById('step-result-input'); if (stepResultInput) stepResultInput.innerText = this.getText('step_result_input');
        const stepAuth = document.getElementById('step-auth-check'); if (stepAuth) stepAuth.innerText = this.getText('step_auth_check');
        const locSelect = document.querySelector('#modal-verify select[name="location"]');
        if (locSelect) {
            const opts = locSelect.options;
            if (opts.length >= 3) {
                opts[0].text = this.getText('location_default');
                opts[1].text = this.getText('loc_doc');
                opts[2].text = this.getText('loc_img');
                if (opts[3]) opts[3].text = this.getText('loc_phy');
            }
        }
        const visitInput = document.querySelector('#modal-verify input[name="visitCode"]'); if (visitInput) visitInput.placeholder = this.getText('patient_visit_code');
        const verifyBtn = document.querySelector('#modal-verify .form-actions button[type="submit"]'); if (verifyBtn) verifyBtn.innerText = this.getText('verify_submit');

        // Localize operator select option texts (name + role)
        const opSelect = document.querySelector('#modal-verify select[name="operatorId"]');
        if (opSelect) {
            Array.from(opSelect.options).forEach(opt => {
                const op = OPERATORS[opt.value];
                if (op) {
                    const roleKey = 'role_' + (op.role || '').toLowerCase();
                    opt.text = `${op.name} (${this.getText(roleKey)})`;
                }
            });
        }

        // Localize result textarea placeholder
        const resultArea = document.querySelector('#modal-verify textarea[name="result"]');
        if (resultArea) resultArea.placeholder = this.getText('result_placeholder');

        // Patient history title
        const histTitle = document.querySelector('#modal-patient-history .header-action h3'); if (histTitle) histTitle.innerText = this.getText('patient_full_record');

        // Digital card
        const dcSub = document.querySelector('#modal-digital-card p'); if (dcSub) dcSub.innerText = this.getText('digital_card_sub');
        const dcShow = document.querySelector('#modal-digital-card div p'); if (dcShow) dcShow.innerText = this.getText('show_code');

        // Add translations for form labels and modal buttons
        const lblName = document.getElementById('label-name'); if (lblName) lblName.innerText = this.getText('patient_name');
        const lblAge = document.getElementById('label-age'); if (lblAge) lblAge.innerText = this.getText('age') || 'Age';
        const btnAddCancel = document.getElementById('btn-add-cancel'); if (btnAddCancel) btnAddCancel.innerText = this.getText('cancel');
        const btnAddRegister = document.getElementById('btn-add-register'); if (btnAddRegister) btnAddRegister.innerText = this.getText('register');

        const lblLocation = document.getElementById('label-location'); if (lblLocation) lblLocation.innerText = this.getText('current_location') || 'Current Location';
        const lblVisitCode = document.getElementById('label-visit-code'); if (lblVisitCode) lblVisitCode.innerText = this.getText('patient_visit_code');
        const lblOperator = document.getElementById('label-operator-id'); if (lblOperator) lblOperator.innerText = this.getText('operator_id');
        const lblPin = document.getElementById('label-security-pin'); if (lblPin) lblPin.innerText = this.getText('security_pin');
        const btnVerifyCancel = document.getElementById('btn-verify-cancel'); if (btnVerifyCancel) btnVerifyCancel.innerText = this.getText('cancel');

        // Patient history labels
        const histName = document.getElementById('hist-label-name'); if (histName) histName.innerText = this.getText('patient_name');
        const histVisit = document.getElementById('hist-label-visit'); if (histVisit) histVisit.innerText = this.getText('visit_code');
        const histStatus = document.getElementById('hist-label-status'); if (histStatus) histStatus.innerText = this.getText('current_status');

        // Edit patient modal labels and buttons
        const editName = document.getElementById('label-edit-name'); if (editName) editName.innerText = this.getText('patient_name');
        const editAge = document.getElementById('label-edit-age'); if (editAge) editAge.innerText = this.getText('age') || 'Age';
        const editVisit = document.getElementById('label-edit-visit'); if (editVisit) editVisit.innerText = this.getText('visit_code_readonly');
        const btnEditCancel = document.getElementById('btn-edit-cancel'); if (btnEditCancel) btnEditCancel.innerText = this.getText('cancel');
        const btnEditSave = document.getElementById('btn-edit-save'); if (btnEditSave) btnEditSave.innerText = this.getText('save');

        // Digital card labels
        const cardLblName = document.getElementById('card-label-name'); if (cardLblName) cardLblName.innerText = this.getText('card_name');
        const cardLblStatus = document.getElementById('card-label-status'); if (cardLblStatus) cardLblStatus.innerText = this.getText('card_status');
        const btnCardClose = document.getElementById('btn-card-close'); if (btnCardClose) btnCardClose.innerText = this.getText('close');
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
        if (confirm(this.getText('confirm_reset'))) {
            localStorage.removeItem('aiCaseManage_db');
            location.reload(); // refresh
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

        // Activate view
        const viewEl = document.getElementById(`view-${viewId}`);
        if (viewEl) viewEl.classList.add('active');

        // Mark corresponding nav button active (avoid relying on a missing event object)
        const navBtn = document.getElementById(`nav-${viewId}`);
        if (navBtn) navBtn.classList.add('active');
        
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
    const visitCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // 自动生成账号与默认密码（避免医生端需要手动输入）
    const rawName = (formData.get('name') || 'patient').toString().toLowerCase().replace(/\s+/g, '');
    let accountCandidate = rawName || 'patient';
    let suffix = 1;
    while (this.data.patients.find(p => p.account === accountCandidate)) {
        accountCandidate = `${rawName}${suffix}`;
        suffix++;
    }
    const defaultPassword = '123456';

    const newPatient = {
        id: Date.now().toString(),
        name: formData.get('name'),
        age: formData.get('age'),
        visitCode: visitCode,
        status: 'Waiting',
        account: accountCandidate,
        password: defaultPassword
    };

    this.data.patients.push(newPatient);
    this.createTask(newPatient.id, 'PRESCRIPTION', 'task_default_PRESCRIPTION');
    
    this.saveData();
    this.closeModal('modal-add-patient');
    this.renderPatientList();
    this.logActivity(this.getText('log_new_patient', { name: newPatient.name, code: visitCode }));
    e.target.reset();
}

    createTask(patientId, type, desc) {
        const task = {
            id: 'T' + Date.now() + Math.floor(Math.random()*100),
            patientId,
            type,
            // use desc_key if provided, otherwise default key per type
            desc_key: desc || `task_default_${type}`,
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
        const taskLabel = this.getText('task_label_' + task.type) || TASK_CONFIG[task.type].label || task.type;
        document.getElementById('verify-task-desc').innerHTML = `
            <strong>${taskLabel}</strong><br>
            ${this.getText('patient_prefix')} ${patient.name}<br>
            <span style="color:red; font-size:12px;">${this.getText('location_default')} ${TASK_CONFIG[task.type].requiredLoc}</span>
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
            errors.push(this.getText('err_pin_incorrect'));
        }

        // 2. 校验患者就诊码 (证明患者在场)
        if (inputVisitCode !== patient.visitCode) {
            errors.push(this.getText('err_visit_code_mismatch'));
        }

        // 3. 校验地点与权限 (Location & Role Check)
        // 规则：当前地点必须匹配任务要求，且操作员必须有权在该地点操作
        const requiredLoc = TASK_CONFIG[task.type].requiredLoc;
        
        // 位置校验：如果已经检测到设备位置并且距离在允许半径内，则视为通过；否则使用用户选择的 location 字段进行比对
        let locationOk = false;
        if (this.currentDetectedLocation && this.currentDetectedLocation.nearest) {
            const nearest = this.currentDetectedLocation.nearest;
            const dist = this.currentDetectedLocation.distance;
            const allowed = LOCATIONS[requiredLoc] && LOCATIONS[requiredLoc].radius;
            if (nearest === requiredLoc && typeof allowed === 'number' && dist <= allowed) {
                locationOk = true;
            }
        }

        if (!locationOk) {
            if (inputLocation !== requiredLoc) {
                errors.push(this.getText('err_location_template', { required: requiredLoc, current: inputLocation }));
            }
        }

        if (operator.allowedLoc !== requiredLoc) {
            errors.push(this.getText('err_permission_template', { name: operator.name, required: requiredLoc }));
        }

        // 如果检测到的位置与任务要求的位置不匹配，阻止提交
        if (this.currentDetectedLocation && this.currentDetectedLocation.nearest && 
            this.currentDetectedLocation.nearest !== requiredLoc) {
            errors.push(this.lang === 'zh' 
                ? `❌ 位置错误：您当前在${LOCATIONS[this.currentDetectedLocation.nearest].name}，但任务要求在${LOCATIONS[requiredLoc].name}。请移动到正确位置后再试。`
                : `❌ Location Error: You are at ${LOCATIONS[this.currentDetectedLocation.nearest].name}, but task requires ${LOCATIONS[requiredLoc].name}. Please move to correct location and try again.`);
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

        // state transition logic
        if (task.type === 'PRESCRIPTION') {
            patient.status = 'In Treatment';

            // 根据病情决定后续任务
            // 60%概率需要同时进行影像检查和理疗
            // 20%概率只需要影像检查
            // 20%概率只需要理疗
            const rand = Math.random();
            if (rand < 0.6) {
                // 同时创建IMAGING和THERAPY任务
                this.createTask(patient.id, 'IMAGING', 'task_default_IMAGING');
                this.createTask(patient.id, 'THERAPY', 'task_default_THERAPY');
                alert(this.getText('auto_imaging_therapy') || '已为您安排影像检查和理疗');
            } else if (rand < 0.8) {
                // 只需要影像检查
                this.createTask(patient.id, 'IMAGING', 'task_default_IMAGING');
                alert(this.getText('auto_imaging'));
            } else {
                // 只需要理疗
                this.createTask(patient.id, 'THERAPY', 'task_default_THERAPY');
                alert(this.getText('auto_therapy'));
            }
        } else {
            // imaging or therapy finished
            // 检查是否还有未完成的任务
            const unfinishedTasks = this.data.tasks.filter(t => 
                t.patientId === patient.id && 
                t.status !== 'COMPLETED'
            );

            if (unfinishedTasks.length === 0) {
                // 所有任务都已完成
                patient.status = 'Completed';
                alert(this.getText('task_completed_alert'));
            } else {
                // 还有其他任务未完成
                alert(this.getText('task_completed_continue') || '当前任务已完成，请继续完成其他任务');
            }
        }


        this.saveData();
        this.closeModal('modal-verify');
        this.renderTaskList();
        const taskLabelForLog = this.getText('task_label_' + task.type) || task.type;
        this.logActivity(this.getText('log_task_completed', { task: taskLabelForLog, patient: patient.name }));
        e.target.reset();
    }

    // --- 渲染逻辑 ---
    renderDashboard() {
        document.getElementById('stat-total-patients').innerText = this.data.patients.length;
        document.getElementById('stat-pending-tasks').innerText = this.data.tasks.filter(t => t.status === 'PENDING').length;
        document.getElementById('stat-completed-tasks').innerText = this.data.tasks.filter(t => t.status === 'COMPLETED').length;

        const logList = document.getElementById('activity-log');
        logList.innerHTML = this.data.logs.slice(0, 5).map(log => {
            // Resolve localized message: prefer msg_key + params, fallback to msg
            let displayMsg = log.msg || '';
            if (log.msg_key) {
                const params = {};
                if (log.params) {
                    Object.keys(log.params).forEach(k => {
                        const v = log.params[k];
                        // If value looks like a translation key for a task/status, resolve it
                        if (typeof v === 'string' && (v.startsWith('task_label_') || v.startsWith('status_'))) {
                            params[k] = this.getText(v);
                        } else {
                            params[k] = v;
                        }
                    });
                }
                displayMsg = this.getText(log.msg_key, params);
            }

            const timePart = (log.time || '').split(' ')[1] || '';
            return `
            <li>
                <span>${displayMsg}</span>
                <span class="log-time">${timePart}</span>
            </li>
        `
        }).join('');
    }

         renderPatientList() {
        const tbody = document.getElementById('patient-list-body');
        // 如果正在搜索，使用过滤后的数据，否则使用全部数据
        const sourceData = this.filteredPatients || this.data.patients;

        if (sourceData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#999;">${this.getText('no_matching_patients')}</td></tr>`;
            return;
        }
        tbody.innerHTML = sourceData.map(p => {
            const statusKey = ('status_' + (p.status || '').replace(/\s+/g, '_').toLowerCase());
            const displayStatus = this.getText(statusKey) || p.status;
            return `
            <tr>
                <td>${p.id}</td>
                <td>
                    <!-- name clickable to show digital card -->
                    <span style="font-weight:bold; cursor:pointer; color:#2563eb;" onclick="app.showDigitalCard('${p.id}')">
                        ${p.name} 📱
                    </span>
                </td>
                <td><code style="background:#eee;padding:2px 4px;border-radius:4px;">${p.visitCode}</code></td>
                <td>
                    <span class="status-badge status-${getStatusClass(p.status)}">
                        ${displayStatus}
                    </span>
                </td>
                <td>
                    <button class="btn-sm" onclick="app.viewPatientHistory('${p.id}')">${this.getText('details') || 'Details'}</button>
                    <button class="btn-sm btn-secondary" onclick="app.openEditPatient('${p.id}')">${this.getText('edit_patient') || 'Edit'}</button>
                    <!-- Revisit -->
                    <button class="btn-sm" style="background:#8b5cf6; color:white; border:none;" onclick="app.startNewVisit('${p.id}')">${this.getText('new_visit') || 'New Visit'}</button>
                    <button class="btn-sm btn-danger" onclick="app.deletePatient('${p.id}')">${this.getText('delete_label') || 'Delete'}</button>
                </td>
            </tr>
        `}).join('');
    }



    filterTasks(type) {
        // Clear previous active state
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));

        // Determine button id for this filter and mark it active
        const btnId = type === 'ALL' ? 'filter-all' : `filter-${type.toLowerCase()}`;
        const btn = document.getElementById(btnId);
        if (btn) btn.classList.add('active');

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

        const unknownName = this.getText('unknown');
        container.innerHTML = tasks.map(t => {
            const patient = this.data.patients.find(p => p.id === t.patientId) || {name: unknownName};
            const config = TASK_CONFIG[t.type];
            const isDone = t.status === 'COMPLETED';
            const label = this.getText('task_label_' + t.type) || t.type;
            const descText = this.getText(t.desc_key) || t.desc || '';
            const statusText = isDone ? (this.getText('status_completed') || 'Completed') : (this.getText('status_inprogress') || 'In Progress');
            const patientPrefix = this.getText('patient_prefix') || 'Patient:';

            return `
            <div class="task-card" style="border-left: 4px solid ${isDone ? '#10b981' : '#f59e0b'}">
                <div class="task-header">
                    <span style="font-weight:bold">${label}</span>
                    <span class="badge ${isDone ? 'badge-completed' : 'badge-pending'}">
                        ${statusText}
                    </span>
                </div>
                <p style="font-size:14px; color:#666; margin-bottom:8px;">${patientPrefix} <strong>${patient.name}</strong></p>
                <p style="font-size:13px; margin-bottom:12px;">${descText}</p>
                
                ${isDone ? `
                    <div style="background:#f9fafb; padding:8px; font-size:12px; border-radius:4px;">
                        <p><strong>${this.getText('result_label')}</strong> ${t.result}</p>
                        <p style="color:#999; margin-top:4px;">${this.getText('performed_by')} ${t.completedBy} @ ${t.completedAt}</p>
                    </div>
                ` : `
                    <div class="task-actions">
                        <button class="btn-primary btn-sm" onclick="app.openVerifyModal('${t.id}')">
                            ⚡ ${this.getText('verify_submit') || 'Execute & Verify'}
                        </button>
                    </div>
                `}
            </div>
            `;
        }).join('');
        
        if (tasks.length === 0) {
            container.innerHTML = `<p style="color:#999; text-align:center; grid-column:1/-1;">${this.getText('no_tasks')}</p>`;
        }
    }
        // --- 新增业务逻辑：查看患者病历详情 ---
    viewPatientHistory(patientId) {
        const patient = this.data.patients.find(p => p.id === patientId);
        if (!patient) return;

        // 1. 填充头部基础信息
        document.getElementById('history-p-name').innerText = patient.name;
        document.getElementById('history-p-code').innerText = patient.visitCode;
        const statusKey = ('status_' + (patient.status || '').replace(/\s+/g, '_').toLowerCase());
        document.getElementById('history-p-status').innerText = this.getText(statusKey) || patient.status;

        // 2. 筛选并排序该患者的任务
        const tasks = this.data.tasks.filter(t => t.patientId === patientId);
        // 按 ID (时间) 正序排列，模拟就诊顺序
        tasks.sort((a, b) => a.id.localeCompare(b.id));

        // 3. 生成时间轴 HTML
        const timelineContainer = document.getElementById('history-timeline-list');
        
        if (tasks.length === 0) {
            timelineContainer.innerHTML = `<li style="color:#999">${this.getText('no_treatment_records')}</li>`;
        } else {
            timelineContainer.innerHTML = tasks.map(t => {
                const isDone = t.status === 'COMPLETED';
                const config = TASK_CONFIG[t.type];
                const label = this.getText('task_label_' + t.type) || t.type;
                const descText = this.getText(t.desc_key) || t.desc || '';
                
                return `
                <li class="timeline-item ${isDone ? 'done' : ''}">
                    <div class="timeline-content">
                        <span class="timeline-time">
                            ${isDone ? t.completedAt : this.getText('status_waiting')}
                        </span>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <strong>${label}</strong>
                            <span class="badge ${isDone ? 'badge-completed' : 'badge-pending'}">
                                ${isDone ? this.getText('status_completed') || 'Completed' : this.getText('status_inprogress') || 'In Progress'}
                            </span>
                        </div>
                        <p style="margin-top:8px; font-size:13px; color:#555;">
                            ${isDone ? `🏁 ${this.getText('result_label')} ${t.result}<br><small>${this.getText('performed_by')} ${t.completedBy}</small>` : `📝 ${this.getText('note') || 'Note:'} ${descText}`}
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
        if (!confirm(this.getText('confirm_delete_patient'))) {
            return;
        }

        // 1. 删除患者
        this.data.patients = this.data.patients.filter(p => p.id !== id);
        
        // 2. 级联删除：把该患者关联的任务也删掉，防止产生垃圾数据
        this.data.tasks = this.data.tasks.filter(t => t.patientId !== id);

        this.saveData();
        this.renderPatientList();
        this.renderDashboard(); // update dashboard
        this.logActivity(this.getText('log_delete_patient', { id }));
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
            this.logActivity(this.getText('log_update_patient', { name: patient.name }));
        }
    }
        // --- 优化逻辑 1: 电子就诊卡 (模拟患者端) ---
    showDigitalCard(id) {
        const patient = this.data.patients.find(p => p.id === id);
        if (!patient) return;

        document.getElementById('card-visit-code').innerText = patient.visitCode;
        document.getElementById('card-p-name').innerText = patient.name;
        const statusKey = ('status_' + (patient.status || '').replace(/\s+/g, '_').toLowerCase());
        document.getElementById('card-p-status').innerText = this.getText(statusKey) || patient.status;
        
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
        if (!confirm(this.getText('confirm_start_new_visit', { name: patient.name }))) return;

        // reset state
        patient.status = 'Waiting';
        
        // create new prescription task (use key so it localizes)
        this.createTask(patientId, 'PRESCRIPTION', 'task_desc_revisit');

        this.saveData();
        this.renderPatientList();
        this.renderTaskList();
        this.logActivity(this.getText('start_new_visit_alert'));
        alert(this.getText('start_new_visit_alert'));
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

