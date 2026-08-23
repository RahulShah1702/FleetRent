import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import api
    from "../../services/api";

import "./Vehicle.css";


function Vehicle() {

    const navigate =
        useNavigate();


    // ============================================================
    // VEHICLES
    // ============================================================

    const [vehicles, setVehicles] =
        useState([]);

    const [assignments, setAssignments] =
        useState([]);

    const [shifts, setShifts] =
        useState([]);


    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("all");


    // ============================================================
    // VEHICLE MODALS
    // ============================================================

    const [showAddModal, setShowAddModal] =
        useState(false);

    const [editingVehicle, setEditingVehicle] =
        useState(null);

    const [showDetails, setShowDetails] =
        useState(null);


    // ============================================================
    // ASSIGN DRIVER
    // ============================================================

    const [showAssignModal, setShowAssignModal] =
        useState(false);

    const [assigningVehicle, setAssigningVehicle] =
        useState(null);

    const [driverSearch, setDriverSearch] =
        useState("");

    const [availableDrivers, setAvailableDrivers] =
        useState([]);

    const [selectedDriver, setSelectedDriver] =
        useState(null);

    const [driverSearchLoading, setDriverSearchLoading] =
        useState(false);

    const [assignLoading, setAssignLoading] =
        useState(false);


    // ============================================================
    // ASSIGNMENT FORM
    // ============================================================

    const [assignmentForm, setAssignmentForm] =
        useState({

            shift: "morning",

            startHour: "",
            startMinute: "",
            startPeriod: "AM",

            endHour: "",
            endMinute: "",
            endPeriod: "PM",

            dailyRent: "",

            startDate: "",

            referenceName: "",

            referenceMobile: ""

        });


    // ============================================================
    // VEHICLE FORM
    // ============================================================

    const emptyForm = {

        registrationNumber: "",
        engineNumber: "",
        chassisNumber: "",
        insuranceEndDate: "",
        pucEndDate: "",
        maintenanceDate: ""

    };


    const [form, setForm] =
        useState(emptyForm);


    // ============================================================
    // LOAD BUSINESS FLEET DATA
    // ============================================================

    const loadFleetData = async () => {

        try {

            setLoading(true);
            setError("");


            const [
                vehiclesResponse,
                assignmentsResponse,
                shiftsResponse
            ] =
                await Promise.all([

                    api.get(
                        "/vehicles"
                    ),

                    api.get(
                        "/assignments"
                    ),

                    api.get(
                        "/shifts/business"
                    )

                ]);


            setVehicles(
                vehiclesResponse.data.vehicles ||
                []
            );


            setAssignments(
                assignmentsResponse.data.assignments ||
                []
            );


            setShifts(
                shiftsResponse.data.shifts ||
                []
            );


        } catch (err) {

            console.error(
                "Vehicle Fleet Load Error:",
                err
            );


            setError(
                err.response?.data?.message ||
                "Unable to load fleet data."
            );


        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadFleetData();

    }, []);


    // ============================================================
    // DATE HELPERS
    // ============================================================

    const pad2 = (
        value
    ) =>
        String(
            value
        ).padStart(
            2,
            "0"
        );


    const getTodayDateString = () => {

        const today =
            new Date();


        return (
            `${today.getFullYear()}-` +
            `${pad2(
                today.getMonth() + 1
            )}-` +
            `${pad2(
                today.getDate()
            )}`
        );

    };


    const getTodayDisplayDate = () => {

        const today =
            new Date();


        return (
            `${pad2(
                today.getDate()
            )}/` +
            `${pad2(
                today.getMonth() + 1
            )}/` +
            `${today.getFullYear()}`
        );

    };


    const getDateKey = (
        value
    ) => {

        if (!value) {
            return "";
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "";
        }


        return (
            `${date.getFullYear()}-` +
            `${pad2(
                date.getMonth() + 1
            )}-` +
            `${pad2(
                date.getDate()
            )}`
        );

    };


    const displayDateToISO = (
        value
    ) => {

        const match =
            value.match(
                /^(\d{2})\/(\d{2})\/(\d{4})$/
            );


        if (!match) {
            return null;
        }


        const day =
            Number(
                match[1]
            );

        const month =
            Number(
                match[2]
            );

        const year =
            Number(
                match[3]
            );


        const date =
            new Date(
                year,
                month - 1,
                day
            );


        if (
            date.getFullYear() !== year ||
            date.getMonth() !== month - 1 ||
            date.getDate() !== day
        ) {
            return null;
        }


        return (
            `${year}-` +
            `${pad2(month)}-` +
            `${pad2(day)}`
        );

    };


    // ============================================================
    // TIME HELPERS
    // ============================================================

    const timeToMinutes = (
        time
    ) => {

        if (!time) {
            return null;
        }


        const value =
            String(
                time
            )
                .trim()
                .toUpperCase();


        const match =
            value.match(
                /^(\d{1,2}):(\d{2})\s*(AM|PM)$/
            );


        if (match) {

            let hours =
                Number(
                    match[1]
                );

            const minutes =
                Number(
                    match[2]
                );

            const period =
                match[3];


            if (
                hours < 1 ||
                hours > 12 ||
                minutes < 0 ||
                minutes > 59
            ) {
                return null;
            }


            if (
                period === "AM" &&
                hours === 12
            ) {
                hours = 0;
            }


            if (
                period === "PM" &&
                hours !== 12
            ) {
                hours += 12;
            }


            return (
                hours * 60 +
                minutes
            );

        }


        const simpleMatch =
            value.match(
                /^(\d{1,2}):(\d{2})$/
            );


        if (simpleMatch) {

            const hours =
                Number(
                    simpleMatch[1]
                );

            const minutes =
                Number(
                    simpleMatch[2]
                );


            if (
                hours < 0 ||
                hours > 23 ||
                minutes < 0 ||
                minutes > 59
            ) {
                return null;
            }


            return (
                hours * 60 +
                minutes
            );

        }


        return null;

    };


    const formatTime = (
        time
    ) => {

        if (!time) {
            return "—";
        }


        const minutes =
            timeToMinutes(
                time
            );


        if (
            minutes === null
        ) {
            return String(
                time
            );
        }


        let hours =
            Math.floor(
                minutes / 60
            );

        const mins =
            minutes % 60;


        const period =
            hours >= 12
                ? "PM"
                : "AM";


        if (hours === 0) {
            hours = 12;
        } else if (
            hours > 12
        ) {
            hours -= 12;
        }


        return (
            `${pad2(hours)}:` +
            `${pad2(mins)} ` +
            `${period}`
        );

    };


    // ============================================================
    // VEHICLE OPERATING DATA
    // ============================================================

    const getVehicleOperations = (
        vehicle
    ) => {

        const vehicleId =
            String(
                vehicle._id
            );


        const vehicleAssignments =
            assignments.filter(
                (assignment) => {

                    const assignmentVehicleId =
                        assignment.vehicleId?._id ||
                        assignment.vehicleId;


                    return (
                        assignmentVehicleId &&
                        String(
                            assignmentVehicleId
                        ) === vehicleId &&
                        assignment.status ===
                            "active"
                    );

                }
            );


        // --------------------------------------------------------
        // No active assignment
        // --------------------------------------------------------

        if (
            vehicleAssignments.length === 0
        ) {

            return {

                assignment: null,

                shift: null,

                driver: null,

                status:
                    "no-driver",

                statusLabel:
                    "No Driver"

            };

        }


        const today =
            getTodayDateString();


        const currentMinutes =
            new Date()
                .getHours() *
                60 +
            new Date()
                .getMinutes();


        // --------------------------------------------------------
        // Find today's shift for every active assignment
        // --------------------------------------------------------

        const todayShifts =
            shifts.filter(
                (shift) => {

                    const shiftAssignmentId =
                        shift.assignmentId?._id ||
                        shift.assignmentId;


                    if (!shiftAssignmentId) {
                        return false;
                    }


                    const belongsToAssignment =
                        vehicleAssignments.some(
                            (assignment) =>
                                String(
                                    assignment._id
                                ) ===
                                String(
                                    shiftAssignmentId
                                )
                        );


                    if (!belongsToAssignment) {
                        return false;
                    }


                    return (
                        getDateKey(
                            shift.shiftDate
                        ) === today
                    );

                }
            );


        // --------------------------------------------------------
        // 1. In-progress has highest priority
        // --------------------------------------------------------

        const runningShift =
            todayShifts.find(
                (shift) =>
                    shift.status ===
                    "in-progress"
            );


        if (runningShift) {

            const assignment =
                vehicleAssignments.find(
                    (item) =>
                        String(
                            item._id
                        ) ===
                        String(
                            runningShift.assignmentId?._id ||
                            runningShift.assignmentId
                        )
                );


            return {

                assignment,

                shift:
                    runningShift,

                driver:
                    assignment?.driverId,

                status:
                    "running",

                statusLabel:
                    "Running"

            };

        }


        // --------------------------------------------------------
        // 2. Day off
        // --------------------------------------------------------

        const dayOffShift =
            todayShifts.find(
                (shift) =>
                    shift.status ===
                    "day-off"
            );


        if (dayOffShift) {

            const assignment =
                vehicleAssignments.find(
                    (item) =>
                        String(
                            item._id
                        ) ===
                        String(
                            dayOffShift.assignmentId?._id ||
                            dayOffShift.assignmentId
                        )
                );


            return {

                assignment,

                shift:
                    dayOffShift,

                driver:
                    assignment?.driverId,

                status:
                    "day-off",

                statusLabel:
                    "Day Off"

            };

        }


        // --------------------------------------------------------
        // 3. Find currently upcoming/not-started shift
        // --------------------------------------------------------

        const upcomingShifts =
            todayShifts
                .filter(
                    (shift) =>
                        shift.status ===
                        "not-started"
                )
                .sort(
                    (a, b) => {

                        const aTime =
                            timeToMinutes(
                                a.plannedStartTime
                            );

                        const bTime =
                            timeToMinutes(
                                b.plannedStartTime
                            );


                        return (
                            (aTime ?? 9999) -
                            (bTime ?? 9999)
                        );

                    }
                );


        const upcomingShift =
            upcomingShifts.find(
                (shift) => {

                    const start =
                        timeToMinutes(
                            shift.plannedStartTime
                        );


                    return (
                        start === null ||
                        currentMinutes <=
                            start
                    );

                }
            );


        if (upcomingShift) {

            const assignment =
                vehicleAssignments.find(
                    (item) =>
                        String(
                            item._id
                        ) ===
                        String(
                            upcomingShift.assignmentId?._id ||
                            upcomingShift.assignmentId
                        )
                );


            return {

                assignment,

                shift:
                    upcomingShift,

                driver:
                    assignment?.driverId,

                status:
                    "not-started",

                statusLabel:
                    "Not Started"

            };

        }


        // --------------------------------------------------------
        // 4. If today's shift completed
        // --------------------------------------------------------

        const completedShift =
            todayShifts.find(
                (shift) =>
                    shift.status ===
                    "completed"
            );


        if (completedShift) {

            const assignment =
                vehicleAssignments.find(
                    (item) =>
                        String(
                            item._id
                        ) ===
                        String(
                            completedShift.assignmentId?._id ||
                            completedShift.assignmentId
                        )
                );


            return {

                assignment,

                shift:
                    completedShift,

                driver:
                    assignment?.driverId,

                status:
                    "completed",

                statusLabel:
                    "Completed"

            };

        }


        // --------------------------------------------------------
        // 5. Active assignment but no shift yet
        // --------------------------------------------------------

        const firstAssignment =
            vehicleAssignments[0];


        return {

            assignment:
                firstAssignment,

            shift:
                null,

            driver:
                firstAssignment.driverId,

            status:
                "scheduled",

            statusLabel:
                "Scheduled"

        };

    };


    // ============================================================
    // VEHICLE FORM
    // ============================================================

    const handleChange = (
        event
    ) => {

        const {
            name,
            value
        } = event.target;


        setForm(
            (current) => ({
                ...current,
                [name]:
                    value
            })
        );

    };


    // ============================================================
    // OPEN ADD VEHICLE
    // ============================================================

    const openAddModal = () => {

        setEditingVehicle(
            null
        );

        setForm(
            emptyForm
        );

        setError("");

        setSuccess("");

        setShowAddModal(
            true
        );

    };


    // ============================================================
    // OPEN EDIT VEHICLE
    // ============================================================

    const openEditModal = (
        vehicle
    ) => {

        setEditingVehicle(
            vehicle
        );


        setForm({

            registrationNumber:
                vehicle.registrationNumber ||
                "",

            engineNumber:
                vehicle.engineNumber ||
                "",

            chassisNumber:
                vehicle.chassisNumber ||
                "",

            insuranceEndDate:
                formatDateForInput(
                    vehicle.insuranceEndDate
                ),

            pucEndDate:
                formatDateForInput(
                    vehicle.pucEndDate
                ),

            maintenanceDate:
                formatDateForInput(
                    vehicle.maintenanceDate
                )

        });


        setError("");

        setSuccess("");

        setShowAddModal(
            true
        );

    };


    // ============================================================
    // DATE INPUT
    // ============================================================

    const formatDateForInput = (
        value
    ) => {

        if (!value) {
            return "";
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "";
        }


        return (
            `${date.getFullYear()}-` +
            `${pad2(
                date.getMonth() + 1
            )}-` +
            `${pad2(
                date.getDate()
            )}`
        );

    };


    const formatDate = (
        value
    ) => {

        if (!value) {
            return "—";
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "—";
        }


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    };


    // ============================================================
    // DOCUMENT STATE
    // ============================================================

    const getDocumentState = (
        value
    ) => {

        if (!value) {
            return "unknown";
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "unknown";
        }


        const today =
            new Date();


        today.setHours(
            0,
            0,
            0,
            0
        );


        const target =
            new Date(date);


        target.setHours(
            0,
            0,
            0,
            0
        );


        const difference =
            Math.ceil(

                (
                    target.getTime() -
                    today.getTime()
                ) /

                (
                    1000 *
                    60 *
                    60 *
                    24
                )

            );


        if (
            difference < 0
        ) {
            return "expired";
        }


        if (
            difference <= 30
        ) {
            return "soon";
        }


        return "valid";

    };


    // ============================================================
    // CLOSE VEHICLE MODAL
    // ============================================================

    const closeModal = () => {

        if (saving) {
            return;
        }


        setShowAddModal(
            false
        );

        setEditingVehicle(
            null
        );

        setForm(
            emptyForm
        );

    };


    // ============================================================
    // SAVE VEHICLE
    // ============================================================

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();


        setSaving(true);

        setError("");

        setSuccess("");


        try {

            const payload = {

                registrationNumber:
                    form.registrationNumber
                        .trim()
                        .toUpperCase(),

                engineNumber:
                    form.engineNumber
                        .trim(),

                chassisNumber:
                    form.chassisNumber
                        .trim(),

                insuranceEndDate:
                    form.insuranceEndDate,

                pucEndDate:
                    form.pucEndDate,

                maintenanceDate:
                    form.maintenanceDate

            };


            if (
                editingVehicle
            ) {

                const response =
                    await api.put(

                        `/vehicles/${editingVehicle._id}`,

                        payload

                    );


                setVehicles(
                    (current) =>
                        current.map(
                            (vehicle) =>
                                vehicle._id ===
                                editingVehicle._id
                                    ? response.data.vehicle
                                    : vehicle
                        )
                );


                setSuccess(
                    "Vehicle updated successfully."
                );

            } else {

                const response =
                    await api.post(

                        "/vehicles",

                        payload

                    );


                setVehicles(
                    (current) => [
                        response.data.vehicle,
                        ...current
                    ]
                );


                setSuccess(
                    "Vehicle added successfully."
                );

            }


            closeModal();


        } catch (err) {

            console.error(
                "Vehicle Save Error:",
                err
            );


            setError(
                err.response?.data?.message ||
                "Unable to save vehicle."
            );

        } finally {

            setSaving(false);

        }

    };


    // ============================================================
    // DEACTIVATE VEHICLE
    // ============================================================

    const handleDeactivate = async (
        vehicle
    ) => {

        const confirmed =
            window.confirm(
                `Deactivate vehicle ${vehicle.registrationNumber}?`
            );


        if (!confirmed) {
            return;
        }


        try {

            setError("");

            setSuccess("");


            const response =
                await api.delete(
                    `/vehicles/${vehicle._id}`
                );


            setVehicles(
                (current) =>
                    current.map(
                        (item) =>
                            item._id === vehicle._id
                                ? response.data.vehicle
                                : item
                    )
            );


            setSuccess(
                `${vehicle.registrationNumber} has been deactivated.`
            );


        } catch (err) {

            console.error(
                "Vehicle Deactivate Error:",
                err
            );


            setError(
                err.response?.data?.message ||
                "Unable to deactivate vehicle."
            );

        }

    };


    // ============================================================
    // ACTIVATE VEHICLE
    // ============================================================

    const handleActivate = async (
        vehicle
    ) => {

        try {

            setError("");

            setSuccess("");


            const response =
                await api.put(

                    `/vehicles/${vehicle._id}`,

                    {
                        status:
                            "active"
                    }

                );


            setVehicles(
                (current) =>
                    current.map(
                        (item) =>
                            item._id === vehicle._id
                                ? response.data.vehicle
                                : item
                    )
            );


            setSuccess(
                `${vehicle.registrationNumber} is active again.`
            );


        } catch (err) {

            console.error(
                "Vehicle Activate Error:",
                err
            );


            setError(
                err.response?.data?.message ||
                "Unable to activate vehicle."
            );

        }

    };


    // ============================================================
    // AVAILABLE DRIVER SEARCH
    // ============================================================

    const searchAvailableDrivers =
        async (
            searchValue
        ) => {

            if (
                !searchValue.trim()
            ) {

                setAvailableDrivers([]);

                return;

            }


            setDriverSearchLoading(
                true
            );


            try {

                const response =
                    await api.get(

                        "/drivers/available/search",

                        {
                            params: {
                                search:
                                    searchValue
                            }
                        }

                    );


                setAvailableDrivers(
                    response.data.drivers ||
                    []
                );


            } catch (error) {

                console.error(
                    "Available Driver Search Error:",
                    error
                );


                setError(
                    error.response?.data?.message ||
                    "Unable to search drivers."
                );


            } finally {

                setDriverSearchLoading(
                    false
                );

            }

        };


    // ============================================================
    // OPEN ASSIGN MODAL
    // ============================================================

    const openAssignModal = (
        vehicle
    ) => {

        setAssigningVehicle(
            vehicle
        );

        setSelectedDriver(
            null
        );

        setDriverSearch("");

        setAvailableDrivers([]);

        setAssignmentForm({

            shift: "morning",

            startHour: "",
            startMinute: "",
            startPeriod: "AM",

            endHour: "",
            endMinute: "",
            endPeriod: "PM",

            dailyRent: "",

            startDate:
                getTodayDisplayDate(),

            referenceName: "",

            referenceMobile: ""

        });

        setError("");

        setSuccess("");

        setShowAssignModal(
            true
        );

    };


    // ============================================================
    // CREATE TIME STRING
    // ============================================================

    const getTimeString = (
        hour,
        minute,
        period
    ) => {

        if (
            !hour ||
            !minute ||
            !period
        ) {
            return "";
        }


        return (
            `${pad2(hour)}:` +
            `${pad2(minute)} ` +
            `${period}`
        );

    };


    const getMinutesFromTime = (
        hour,
        minute,
        period
    ) => {

        if (
            !hour ||
            !minute ||
            !period
        ) {
            return null;
        }


        let hours =
            Number(hour);


        const minutes =
            Number(minute);


        if (
            period === "AM" &&
            hours === 12
        ) {
            hours = 0;
        }


        if (
            period === "PM" &&
            hours !== 12
        ) {
            hours += 12;
        }


        return (
            hours * 60 +
            minutes
        );

    };


    // ============================================================
    // ASSIGN DRIVER
    // ============================================================

    const handleAssignDriver =
        async (
            event
        ) => {

            event.preventDefault();

            setError("");

            setSuccess("");


            if (
                !selectedDriver
            ) {

                setError(
                    "Please select a driver."
                );

                return;

            }


            const startMinutes =
                getMinutesFromTime(

                    assignmentForm.startHour,
                    assignmentForm.startMinute,
                    assignmentForm.startPeriod

                );


            const endMinutes =
                getMinutesFromTime(

                    assignmentForm.endHour,
                    assignmentForm.endMinute,
                    assignmentForm.endPeriod

                );


            if (
                startMinutes === null ||
                endMinutes === null
            ) {

                setError(
                    "Please select both shift start and end time."
                );

                return;

            }


            if (
                startMinutes ===
                endMinutes
            ) {

                setError(
                    "Shift start and end time cannot be the same."
                );

                return;

            }


            const rent =
                Number(
                    assignmentForm.dailyRent
                );


            if (
                !Number.isFinite(
                    rent
                ) ||
                rent <= 0
            ) {

                setError(
                    "Daily rent must be greater than ₹0."
                );

                return;

            }


            const isoDate =
                displayDateToISO(
                    assignmentForm.startDate
                        .trim()
                );


            if (!isoDate) {

                setError(
                    "Enter a valid date in DD/MM/YYYY format."
                );

                return;

            }


            if (
                isoDate <
                getTodayDateString()
            ) {

                setError(
                    "Start date cannot be in the past."
                );

                return;

            }


            const referenceName =
                assignmentForm.referenceName
                    .trim();


            if (
                !referenceName
            ) {

                setError(
                    "Please enter the reference person's name."
                );

                return;

            }


            const referenceMobile =
                assignmentForm.referenceMobile
                    .replace(
                        /\D/g,
                        ""
                    );


            if (
                !/^[6-9]\d{9}$/.test(
                    referenceMobile
                )
            ) {

                setError(
                    "Enter a valid 10-digit Indian mobile number."
                );

                return;

            }


            try {

                setAssignLoading(
                    true
                );


                await api.post(

                    "/assignments",

                    {

                        driverId:
                            selectedDriver._id,

                        vehicleId:
                            assigningVehicle._id,

                        shift:
                            assignmentForm.shift,

                        shiftStartTime:
                            getTimeString(

                                assignmentForm.startHour,
                                assignmentForm.startMinute,
                                assignmentForm.startPeriod

                            ),

                        shiftEndTime:
                            getTimeString(

                                assignmentForm.endHour,
                                assignmentForm.endMinute,
                                assignmentForm.endPeriod

                            ),

                        dailyRent:
                            rent,

                        startDate:
                            isoDate,

                        referenceName,

                        referenceMobileNumber:
                            referenceMobile

                    }

                );


                setSuccess(
                    `${selectedDriver.fullName} has been assigned to ${assigningVehicle.registrationNumber}.`
                );


                setShowAssignModal(
                    false
                );

                setAssigningVehicle(
                    null
                );

                setSelectedDriver(
                    null
                );

                setDriverSearch("");

                setAvailableDrivers([]);


                await loadFleetData();


            } catch (error) {

                console.error(
                    "Assign Driver Error:",
                    error
                );


                setError(
                    error.response?.data?.message ||
                    "Unable to assign driver."
                );

            } finally {

                setAssignLoading(
                    false
                );

            }

        };


    // ============================================================
    // SEARCH / FILTER
    // ============================================================

    const filteredVehicles =
        useMemo(
            () => {

                const query =
                    search
                        .trim()
                        .toLowerCase();


                return vehicles.filter(
                    (vehicle) => {

                        const matchesSearch =
                            !query ||

                            vehicle
                                .registrationNumber
                                ?.toLowerCase()
                                .includes(
                                    query
                                ) ||

                            vehicle
                                .engineNumber
                                ?.toLowerCase()
                                .includes(
                                    query
                                ) ||

                            vehicle
                                .chassisNumber
                                ?.toLowerCase()
                                .includes(
                                    query
                                );


                        const matchesStatus =
                            statusFilter ===
                                "all" ||

                            vehicle.status ===
                                statusFilter;


                        return (
                            matchesSearch &&
                            matchesStatus
                        );

                    }
                );

            },

            [
                vehicles,
                search,
                statusFilter
            ]

        );


    // ============================================================
    // COUNTS
    // ============================================================

    const totalVehicles =
        vehicles.length;


    const activeVehicles =
        vehicles.filter(
            (vehicle) =>
                vehicle.status ===
                "active"
        ).length;


    const inactiveVehicles =
        vehicles.filter(
            (vehicle) =>
                vehicle.status ===
                "inactive"
        ).length;


    const documentsExpiring =
        vehicles.filter(

            (vehicle) =>

                getDocumentState(
                    vehicle.insuranceEndDate
                ) === "expired" ||

                getDocumentState(
                    vehicle.insuranceEndDate
                ) === "soon" ||

                getDocumentState(
                    vehicle.pucEndDate
                ) === "expired" ||

                getDocumentState(
                    vehicle.pucEndDate
                ) === "soon" ||

                getDocumentState(
                    vehicle.maintenanceDate
                ) === "expired" ||

                getDocumentState(
                    vehicle.maintenanceDate
                ) === "soon"

        ).length;


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (

            <div
                className="vehicle-page"
            >

                <div
                    className="vehicle-loading"
                >
                    Loading vehicles...
                </div>

            </div>

        );

    }


    // ============================================================
    // MAIN UI
    // ============================================================

    return (

        <div
            className="vehicle-page"
        >


            {/* ====================================================
                HEADER
            ==================================================== */}

            <header
                className="vehicle-header"
            >

                <div>

                    <button
                        className=
                            "vehicle-back-button"

                        onClick={() =>
                            navigate(
                                "/business/dashboard"
                            )
                        }
                    >
                        ← Dashboard
                    </button>


                    <p
                        className=
                            "vehicle-eyebrow"
                    >
                        FLEETRENT
                    </p>


                    <h1>
                        Vehicles
                    </h1>


                    <p
                        className=
                            "vehicle-subtitle"
                    >
                        Manage your fleet, vehicle documents and daily operations.
                    </p>

                </div>


                <button
                    className=
                        "vehicle-add-button"

                    onClick={
                        openAddModal
                    }
                >
                    + Add Vehicle
                </button>

            </header>


            {/* ====================================================
                ALERTS
            ==================================================== */}

            {success && (

                <div
                    className=
                        "vehicle-success"
                >
                    {success}
                </div>

            )}


            {error && (

                <div
                    className=
                        "vehicle-error"
                >
                    {error}
                </div>

            )}


            {/* ====================================================
                STATS
            ==================================================== */}

            <section
                className=
                    "vehicle-stats"
            >

                <div
                    className=
                        "vehicle-stat-card"
                >

                    <span>
                        Total Vehicles
                    </span>

                    <strong>
                        {totalVehicles}
                    </strong>

                </div>


                <div
                    className=
                        "vehicle-stat-card vehicle-stat-active"
                >

                    <span>
                        Active
                    </span>

                    <strong>
                        {activeVehicles}
                    </strong>

                </div>


                <div
                    className=
                        "vehicle-stat-card vehicle-stat-inactive"
                >

                    <span>
                        Inactive
                    </span>

                    <strong>
                        {inactiveVehicles}
                    </strong>

                </div>


                <div
                    className=
                        "vehicle-stat-card vehicle-stat-warning"
                >

                    <span>
                        Documents / Maintenance
                    </span>

                    <strong>
                        {documentsExpiring}
                    </strong>

                    <small>
                        Expired or due within 30 days
                    </small>

                </div>

            </section>


            {/* ====================================================
                SEARCH / FILTER
            ==================================================== */}

            <section
                className=
                    "vehicle-toolbar"
            >

                <div
                    className=
                        "vehicle-search"
                >

                    <span>
                        🔎
                    </span>


                    <input
                        type="text"
                        placeholder=
                            "Search registration, engine or chassis number..."
                        value={
                            search
                        }
                        onChange={(
                            event
                        ) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>


                <div
                    className=
                        "vehicle-filter"
                >

                    <button
                        className={
                            statusFilter ===
                            "all"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setStatusFilter(
                                "all"
                            )
                        }
                    >
                        All
                    </button>


                    <button
                        className={
                            statusFilter ===
                            "active"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setStatusFilter(
                                "active"
                            )
                        }
                    >
                        Active
                    </button>


                    <button
                        className={
                            statusFilter ===
                            "inactive"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setStatusFilter(
                                "inactive"
                            )
                        }
                    >
                        Inactive
                    </button>

                </div>

            </section>


            {/* ====================================================
                VEHICLE LIST
            ==================================================== */}

            <section
                className=
                    "vehicle-list-card"
            >

                <div
                    className=
                        "vehicle-list-header"
                >

                    <div>

                        <p
                            className=
                                "vehicle-section-eyebrow"
                        >
                            YOUR FLEET
                        </p>

                        <h2>
                            Vehicle List
                        </h2>

                    </div>


                    <span>

                        {filteredVehicles.length}

                        {" "}

                        vehicle

                        {
                            filteredVehicles.length !==
                            1
                                ? "s"
                                : ""
                        }

                    </span>

                </div>


                {filteredVehicles.length ===
                    0 ? (

                    <div
                        className=
                            "vehicle-empty"
                    >

                        <div>
                            🚗
                        </div>

                        <h3>
                            No vehicles found
                        </h3>

                        <p>
                            {
                                vehicles.length ===
                                0
                                    ? "Add your first vehicle to start managing your fleet."
                                    : "Try changing your search or status filter."
                            }
                        </p>


                        {vehicles.length ===
                            0 && (

                            <button
                                onClick={
                                    openAddModal
                                }
                            >
                                + Add Vehicle
                            </button>

                        )}

                    </div>

                ) : (

                    <div
                        className=
                            "vehicle-table-wrapper"
                    >

                        <table
                            className=
                                "vehicle-table"
                        >

                            <thead>

                                <tr>

                                    <th>
                                        Vehicle
                                    </th>

                                    <th>
                                        Driver / Shift
                                    </th>

                                    <th>
                                        Today's Status
                                    </th>

                                    <th>
                                        Rent
                                    </th>

                                    <th>
                                        Documents
                                    </th>

                                    <th>
                                        Vehicle Status
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredVehicles.map(
                                    (vehicle) => {

                                        const operations =
                                            getVehicleOperations(
                                                vehicle
                                            );


                                        return (

                                            <tr
                                                key={
                                                    vehicle._id
                                                }
                                            >

                                                {/* VEHICLE */}

                                                <td>

                                                    <div
                                                        className=
                                                            "vehicle-main-info"
                                                    >

                                                        <strong>
                                                            {
                                                                vehicle.registrationNumber
                                                            }
                                                        </strong>

                                                        <span>
                                                            Added{" "}
                                                            {
                                                                formatDate(
                                                                    vehicle.createdAt
                                                                )
                                                            }
                                                        </span>

                                                    </div>

                                                </td>


                                                {/* DRIVER / SHIFT */}

                                                <td>

                                                    {operations.driver ? (

                                                        <div
                                                            className=
                                                                "vehicle-operation-info"
                                                        >

                                                            <strong>
                                                                {
                                                                    operations
                                                                        .driver
                                                                        .fullName ||
                                                                    "Driver"
                                                                }
                                                            </strong>


                                                            <span>

                                                                {
                                                                    operations
                                                                        .shift
                                                                        ?.shiftType ||
                                                                    operations
                                                                        .assignment
                                                                        ?.shift ||
                                                                    "—"
                                                                }

                                                                {" · "}

                                                                {

                                                                    formatTime(

                                                                        operations
                                                                            .shift
                                                                            ?.plannedStartTime ||

                                                                        operations
                                                                            .assignment
                                                                            ?.shiftStartTime

                                                                    )

                                                                }

                                                                {" - "}

                                                                {

                                                                    formatTime(

                                                                        operations
                                                                            .shift
                                                                            ?.plannedEndTime ||

                                                                        operations
                                                                            .assignment
                                                                            ?.shiftEndTime

                                                                    )

                                                                }

                                                            </span>

                                                        </div>

                                                    ) : (

                                                        <span
                                                            className=
                                                                "vehicle-no-driver"
                                                        >
                                                            No driver assigned
                                                        </span>

                                                    )}

                                                </td>


                                                {/* TODAY STATUS */}

                                                <td>

                                                    <span
                                                        className={
                                                            `vehicle-operational-badge ${
                                                                operations.status
                                                            }`
                                                        }
                                                    >

                                                        {
                                                            operations.status ===
                                                            "running"
                                                                ? "● Running"

                                                                : operations.status ===
                                                                  "not-started"
                                                                    ? "● Not Started"

                                                                    : operations.status ===
                                                                      "day-off"
                                                                        ? "● Day Off"

                                                                        : operations.status ===
                                                                          "completed"
                                                                            ? "✓ Completed"

                                                                            : operations.status ===
                                                                              "scheduled"
                                                                                ? "○ Scheduled"

                                                                                : "— No Driver"
                                                        }

                                                    </span>

                                                </td>


                                                {/* RENT */}

                                                <td>

                                                    {
                                                        operations.assignment
                                                            ?.dailyRent !==
                                                        undefined

                                                            ? (

                                                                <strong
                                                                    className=
                                                                        "vehicle-rent"
                                                                >
                                                                    ₹
                                                                    {
                                                                        Number(
                                                                            operations
                                                                                .assignment
                                                                                .dailyRent
                                                                        ).toLocaleString(
                                                                            "en-IN"
                                                                        )
                                                                    }
                                                                </strong>

                                                            )

                                                            : "—"

                                                    }

                                                </td>


                                                {/* DOCUMENTS */}

                                                <td>

                                                    <div
                                                        className=
                                                            "vehicle-document-status"
                                                    >

                                                        <span
                                                            className={
                                                                getDocumentState(
                                                                    vehicle.insuranceEndDate
                                                                )
                                                            }
                                                        >
                                                            Insurance
                                                        </span>


                                                        <span
                                                            className={
                                                                getDocumentState(
                                                                    vehicle.pucEndDate
                                                                )
                                                            }
                                                        >
                                                            PUC
                                                        </span>


                                                        <span
                                                            className={
                                                                getDocumentState(
                                                                    vehicle.maintenanceDate
                                                                )
                                                            }
                                                        >
                                                            Maintenance
                                                        </span>

                                                    </div>

                                                </td>


                                                {/* VEHICLE STATUS */}

                                                <td>

                                                    <span
                                                        className={
                                                            `vehicle-status-badge ${
                                                                vehicle.status
                                                            }`
                                                        }
                                                    >

                                                        {
                                                            vehicle.status ===
                                                            "active"
                                                                ? "Active"
                                                                : "Inactive"
                                                        }

                                                    </span>

                                                </td>


                                                {/* ACTIONS */}

                                                <td>

                                                    <div
                                                        className=
                                                            "vehicle-actions"
                                                    >

                                                        <button
                                                            onClick={() =>
                                                                setShowDetails(
                                                                    vehicle
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </button>


                                                        <button
                                                            onClick={() =>
                                                                openEditModal(
                                                                    vehicle
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>


                                                        {/* VIEW ASSIGNMENT */}

                                                        {operations.assignment && (

                                                            <button
                                                                className="view-assignment-action"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/business/assignments/${operations.assignment._id}`
                                                                    )
                                                                }
                                                            >
                                                                View Assignment
                                                            </button>

                                                        )}


                                                        {/* ASSIGN DRIVER */}

                                                        {vehicle.status ===
                                                            "active" && (

                                                            <button
                                                                className="assign-driver-action"
                                                                onClick={() =>
                                                                    openAssignModal(
                                                                        vehicle
                                                                    )
                                                                }
                                                            >
                                                                Assign Driver
                                                            </button>

                                                        )}


                                                        {/* DEACTIVATE / ACTIVATE */}

                                                        {vehicle.status ===
                                                            "active" ? (

                                                            <button
                                                                className="danger-action"
                                                                onClick={() =>
                                                                    handleDeactivate(
                                                                        vehicle
                                                                    )
                                                                }
                                                            >
                                                                Deactivate
                                                            </button>

                                                        ) : (

                                                            <button
                                                                className="activate-action"
                                                                onClick={() =>
                                                                    handleActivate(
                                                                        vehicle
                                                                    )
                                                                }
                                                            >
                                                                Activate
                                                            </button>

                                                        )}

                                                    </div>

                                                </td>

                                            </tr>

                                        );

                                    }

                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>


            {/* ====================================================
                ADD / EDIT VEHICLE MODAL
            ==================================================== */}

            {showAddModal && (

                <div
                    className=
                        "vehicle-modal-overlay"
                >

                    <div
                        className=
                            "vehicle-modal"
                    >

                        <div
                            className=
                                "vehicle-modal-header"
                        >

                            <div>

                                <p
                                    className=
                                        "vehicle-section-eyebrow"
                                >
                                    FLEET
                                </p>

                                <h2>
                                    {
                                        editingVehicle
                                            ? "Edit Vehicle"
                                            : "Add Vehicle"
                                    }
                                </h2>

                            </div>


                            <button
                                className=
                                    "vehicle-modal-close"
                                onClick={
                                    closeModal
                                }
                            >
                                ×
                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >

                            <div
                                className=
                                    "vehicle-form-grid"
                            >

                                <label>

                                    <span>
                                        Registration Number
                                    </span>

                                    <input
                                        name=
                                            "registrationNumber"
                                        value={
                                            form.registrationNumber
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder=
                                            "MH01AB1234"
                                        required
                                    />

                                </label>


                                <label>

                                    <span>
                                        Engine Number
                                    </span>

                                    <input
                                        name=
                                            "engineNumber"
                                        value={
                                            form.engineNumber
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder=
                                            "Engine number"
                                        required
                                    />

                                </label>


                                <label>

                                    <span>
                                        Chassis Number
                                    </span>

                                    <input
                                        name=
                                            "chassisNumber"
                                        value={
                                            form.chassisNumber
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder=
                                            "Chassis number"
                                        required
                                    />

                                </label>


                                <label>

                                    <span>
                                        Insurance End Date
                                    </span>

                                    <input
                                        type="date"
                                        name=
                                            "insuranceEndDate"
                                        value={
                                            form.insuranceEndDate
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </label>


                                <label>

                                    <span>
                                        PUC End Date
                                    </span>

                                    <input
                                        type="date"
                                        name=
                                            "pucEndDate"
                                        value={
                                            form.pucEndDate
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </label>


                                <label>

                                    <span>
                                        Maintenance Date
                                    </span>

                                    <input
                                        type="date"
                                        name=
                                            "maintenanceDate"
                                        value={
                                            form.maintenanceDate
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </label>

                            </div>


                            <div
                                className=
                                    "vehicle-modal-actions"
                            >

                                <button
                                    type="button"
                                    className=
                                        "vehicle-cancel-button"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className=
                                        "vehicle-save-button"
                                    disabled={
                                        saving
                                    }
                                >
                                    {
                                        saving
                                            ? "Saving..."
                                            : editingVehicle
                                                ? "Save Changes"
                                                : "Add Vehicle"
                                    }
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* ====================================================
                VEHICLE DETAILS MODAL
            ==================================================== */}

            {showDetails && (

                <div
                    className=
                        "vehicle-modal-overlay"
                >

                    <div
                        className=
                            "vehicle-modal vehicle-details-modal"
                    >

                        <div
                            className=
                                "vehicle-modal-header"
                        >

                            <div>

                                <p
                                    className=
                                        "vehicle-section-eyebrow"
                                >
                                    VEHICLE DETAILS
                                </p>

                                <h2>
                                    {
                                        showDetails.registrationNumber
                                    }
                                </h2>

                            </div>


                            <button
                                className=
                                    "vehicle-modal-close"
                                onClick={() =>
                                    setShowDetails(
                                        null
                                    )
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div
                            className=
                                "vehicle-details-grid"
                        >

                            <div>

                                <span>
                                    Registration
                                </span>

                                <strong>
                                    {
                                        showDetails.registrationNumber
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Vehicle Status
                                </span>

                                <strong>
                                    {
                                        showDetails.status ===
                                        "active"
                                            ? "Active"
                                            : "Inactive"
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Engine Number
                                </span>

                                <strong>
                                    {
                                        showDetails.engineNumber
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Chassis Number
                                </span>

                                <strong>
                                    {
                                        showDetails.chassisNumber
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Insurance End
                                </span>

                                <strong>
                                    {
                                        formatDate(
                                            showDetails.insuranceEndDate
                                        )
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    PUC End
                                </span>

                                <strong>
                                    {
                                        formatDate(
                                            showDetails.pucEndDate
                                        )
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Maintenance Date
                                </span>

                                <strong>
                                    {
                                        formatDate(
                                            showDetails.maintenanceDate
                                        )
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Added On
                                </span>

                                <strong>
                                    {
                                        formatDate(
                                            showDetails.createdAt
                                        )
                                    }
                                </strong>

                            </div>


                            {(() => {

                                const operation =
                                    getVehicleOperations(
                                        showDetails
                                    );


                                return (

                                    <>

                                        <div>

                                            <span>
                                                Current Driver
                                            </span>

                                            <strong>

                                                {
                                                    operation
                                                        .driver
                                                        ?.fullName ||
                                                    "No driver assigned"
                                                }

                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Today's Status
                                            </span>

                                            <strong>

                                                {
                                                    operation.statusLabel
                                                }

                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Current Shift
                                            </span>

                                            <strong>

                                                {
                                                    operation.shift
                                                        ?.shiftType ||
                                                    operation.assignment
                                                        ?.shift ||
                                                    "—"
                                                }

                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Daily Rent
                                            </span>

                                            <strong>

                                                {
                                                    operation.assignment
                                                        ?.dailyRent !==
                                                    undefined

                                                        ? `₹${Number(
                                                            operation
                                                                .assignment
                                                                .dailyRent
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}`

                                                        : "—"
                                                }

                                            </strong>

                                        </div>

                                    </>

                                );

                            })()}

                        </div>


                        <div
                            className=
                                "vehicle-details-actions"
                        >

                            <button
                                onClick={() => {

                                    setShowDetails(
                                        null
                                    );

                                    openEditModal(
                                        showDetails
                                    );

                                }}
                            >
                                Edit Vehicle
                            </button>


                            {showDetails.status ===
                                "active" && (

                                <button
                                    onClick={() => {

                                        setShowDetails(
                                            null
                                        );

                                        openAssignModal(
                                            showDetails
                                        );

                                    }}
                                >
                                    Assign Driver
                                </button>

                            )}

                        </div>

                    </div>

                </div>

            )}


            {/* ====================================================
                ASSIGN DRIVER MODAL
            ==================================================== */}

            {showAssignModal &&
                assigningVehicle && (

                <div
                    className=
                        "vehicle-modal-overlay"
                >

                    <div
                        className=
                            "vehicle-modal assign-driver-modal"
                    >

                        <div
                            className=
                                "vehicle-modal-header"
                        >

                            <div>

                                <p
                                    className=
                                        "vehicle-section-eyebrow"
                                >
                                    ASSIGNMENT
                                </p>

                                <h2>
                                    Assign Driver
                                </h2>

                                <p
                                    className=
                                        "assign-vehicle-name"
                                >
                                    Vehicle:{" "}

                                    <strong>
                                        {
                                            assigningVehicle
                                                .registrationNumber
                                        }
                                    </strong>

                                </p>

                            </div>


                            <button
                                type="button"
                                className=
                                    "vehicle-modal-close"
                                onClick={() =>
                                    setShowAssignModal(
                                        false
                                    )
                                }
                            >
                                ×
                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleAssignDriver
                            }
                        >

                            {/* DRIVER SEARCH */}

                            <div
                                className=
                                    "driver-search-section"
                            >

                                <label>

                                    <span>
                                        Search Available Driver
                                    </span>


                                    <div
                                        className=
                                            "driver-search-box"
                                    >

                                        <span>
                                            🔎
                                        </span>


                                        <input
                                            type="text"
                                            placeholder=
                                                "Search name, mobile, email or licence..."
                                            value={
                                                driverSearch
                                            }
                                            onChange={(
                                                event
                                            ) => {

                                                const value =
                                                    event
                                                        .target
                                                        .value;


                                                setDriverSearch(
                                                    value
                                                );


                                                searchAvailableDrivers(
                                                    value
                                                );

                                            }}
                                        />

                                    </div>

                                </label>


                                <p
                                    className=
                                        "driver-search-help"
                                >
                                    Only drivers who are not currently assigned to an active vehicle are shown.
                                </p>


                                {driverSearchLoading && (

                                    <div
                                        className=
                                            "driver-search-loading"
                                    >
                                        Searching drivers...
                                    </div>

                                )}


                                {!driverSearchLoading &&
                                    availableDrivers.length >
                                    0 && (

                                    <div
                                        className=
                                            "available-driver-list"
                                    >

                                        {availableDrivers.map(
                                            (driver) => (

                                            <button
                                                type="button"
                                                key={
                                                    driver._id
                                                }
                                                className={
                                                    `available-driver-card ${
                                                        selectedDriver?._id ===
                                                        driver._id
                                                            ? "selected"
                                                            : ""
                                                    }`
                                                }
                                                onClick={() =>
                                                    setSelectedDriver(
                                                        driver
                                                    )
                                                }
                                            >

                                                <div
                                                    className=
                                                        "available-driver-avatar"
                                                >
                                                    {
                                                        driver
                                                            .fullName
                                                            ?.charAt(
                                                                0
                                                            )
                                                            ?.toUpperCase() ||
                                                        "D"
                                                    }
                                                </div>


                                                <div
                                                    className=
                                                        "available-driver-info"
                                                >

                                                    <strong>
                                                        {
                                                            driver.fullName
                                                        }
                                                    </strong>

                                                    <span>
                                                        📱{" "}
                                                        {
                                                            driver.mobileNumber ||
                                                            "No mobile number"
                                                        }
                                                    </span>

                                                    <span>
                                                        {
                                                            driver.email ||
                                                            "No email"
                                                        }
                                                    </span>

                                                </div>


                                                <div
                                                    className=
                                                        "available-driver-select"
                                                >
                                                    {
                                                        selectedDriver?._id ===
                                                        driver._id
                                                            ? "✓ Selected"
                                                            : "Select"
                                                    }
                                                </div>

                                            </button>

                                        ))}

                                    </div>

                                )}


                                {!driverSearchLoading &&
                                    driverSearch &&
                                    availableDrivers.length ===
                                    0 && (

                                    <div
                                        className=
                                            "no-available-drivers"
                                    >
                                        No available driver found.
                                    </div>

                                )}


                                {selectedDriver && (

                                    <div
                                        className=
                                            "selected-driver-box"
                                    >

                                        <span>
                                            Selected Driver
                                        </span>


                                        <strong>
                                            {
                                                selectedDriver.fullName
                                            }
                                        </strong>


                                        <small>
                                            {
                                                selectedDriver.mobileNumber
                                            }
                                        </small>

                                    </div>

                                )}

                            </div>


                            {/* ASSIGNMENT FORM */}

                            <div
                                className=
                                    "assignment-form-grid"
                            >

                                {/* SHIFT */}

                                <div
                                    className=
                                        "assignment-field full-width"
                                >

                                    <label>
                                        Shift
                                    </label>


                                    <div
                                        className=
                                            "shift-selector"
                                    >

                                        <button
                                            type="button"
                                            className={
                                                assignmentForm.shift ===
                                                "morning"
                                                    ? "shift-option active"
                                                    : "shift-option"
                                            }
                                            onClick={() =>
                                                setAssignmentForm(
                                                    current => ({
                                                        ...current,
                                                        shift:
                                                            "morning"
                                                    })
                                                )
                                            }
                                        >

                                            <span
                                                className=
                                                    "shift-icon"
                                            >
                                                ☀️
                                            </span>


                                            <span>

                                                <strong>
                                                    Morning
                                                </strong>

                                                <small>
                                                    Morning shift
                                                </small>

                                            </span>

                                        </button>


                                        <button
                                            type="button"
                                            className={
                                                assignmentForm.shift ===
                                                "evening"
                                                    ? "shift-option active"
                                                    : "shift-option"
                                            }
                                            onClick={() =>
                                                setAssignmentForm(
                                                    current => ({
                                                        ...current,
                                                        shift:
                                                            "evening"
                                                    })
                                                )
                                            }
                                        >

                                            <span
                                                className=
                                                    "shift-icon"
                                            >
                                                🌙
                                            </span>


                                            <span>

                                                <strong>
                                                    Evening
                                                </strong>

                                                <small>
                                                    Evening shift
                                                </small>

                                            </span>

                                        </button>


                                        <button
                                            type="button"
                                            className={
                                                assignmentForm.shift ===
                                                "full-time"
                                                    ? "shift-option active"
                                                    : "shift-option"
                                            }
                                            onClick={() =>
                                                setAssignmentForm(
                                                    current => ({
                                                        ...current,
                                                        shift:
                                                            "full-time"
                                                    })
                                                )
                                            }
                                        >

                                            <span
                                                className=
                                                    "shift-icon"
                                            >
                                                🕐
                                            </span>


                                            <span>

                                                <strong>
                                                    Full-time
                                                </strong>

                                                <small>
                                                    Full working day
                                                </small>

                                            </span>

                                        </button>

                                    </div>

                                </div>


                                {/* START TIME */}

                                <div
                                    className=
                                        "assignment-field"
                                >

                                    <label>
                                        Shift Start Time
                                    </label>


                                    <div
                                        className=
                                            "time-selector"
                                    >

                                        <select
                                            value={
                                                assignmentForm.startHour
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setAssignmentForm(
                                                    current => ({
                                                        ...current,
                                                        startHour:
                                                            event
                                                                .target
                                                                .value
                                                    })
                                                )
                                            }
                                        >

                                            <option value="">
                                                Hour
                                            </option>


                                            {Array.from(
                                                {
                                                    length: 12
                                                },
                                                (
                                                    _,
                                                    index
                                                ) => (

                                                    <option
                                                        key={
                                                            index + 1
                                                        }
                                                        value={
                                                            index + 1
                                                        }
                                                    >
                                                        {
                                                            pad2(
                                                                index + 1
                                                            )
                                                        }
                                                    </option>

                                                )
                                            )}

                                        </select>


                                        <select
                                            value={
                                                assignmentForm.startMinute
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setAssignmentForm(
                                                    current => ({
                                                        ...current,
                                                        startMinute:
                                                            event
                                                                .target
                                                                .value
                                                    })
                                                )
                                            }
                                        >

                                            <option value="">
                                                Min
                                            </option>

                                            {[
                                                "00",
                                                "15",
                                                "30",
                                                "45"
                                            ].map(
                                                (minute) => (

                                                    <option
                                                        key={
                                                            minute
                                                        }
                                                        value={
                                                            minute
                                                        }
                                                    >
                                                        {minute}
                                                    </option>

                                                )
                                            )}

                                        </select>


                                        <select
                                            value={
                                                assignmentForm.startPeriod
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setAssignmentForm(
                                                    current => ({
                                                        ...current,
                                                        startPeriod:
                                                            event
                                                                .target
                                                                .value
                                                    })
                                                )
                                            }
                                        >

                                            <option value="AM">
                                                AM
                                            </option>

                                            <option value="PM">
                                                PM
                                            </option>

                                        </select>

                                    </div>

                                </div>


                                {/* END TIME */}

                                <div
                                    className=
                                        "assignment-field"
                                >

                                    <label>
                                        Shift End Time
                                    </label>


                                    <div
                                        className=
                                            "time-selector"
                                    >

                                        <select
                                            value={
                                                assignmentForm.endHour
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setAssignmentForm(
                                                    current => ({
                                                        ...current,
                                                        endHour:
                                                            event
                                                                .target
                                                                .value
                                                    })
                                                )
                                            }
                                        >

                                            <option value="">
                                                Hour
                                            </option>

                                            {Array.from(
                                                {
                                                    length: 12
                                                },
                                                (
                                                    _,
                                                    index
                                                ) => (

                                                    <option
                                                        key={
                                                            index + 1
                                                        }
                                                        value={
                                                            index + 1
                                                        }
                                                    >
                                                        {
                                                            pad2(
                                                                index + 1
                                                            )
                                                        }
                                                    </option>

                                                )
                                            )}

                                        </select>


                                        <select
                                            value={
                                                assignmentForm.endMinute
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setAssignmentForm(
                                                    current => ({
                                                        ...current,
                                                        endMinute:
                                                            event
                                                                .target
                                                                .value
                                                    })
                                                )
                                            }
                                        >

                                            <option value="">
                                                Min
                                            </option>

                                            {[
                                                "00",
                                                "15",
                                                "30",
                                                "45"
                                            ].map(
                                                (minute) => (

                                                    <option
                                                        key={
                                                            minute
                                                        }
                                                        value={
                                                            minute
                                                        }
                                                    >
                                                        {minute}
                                                    </option>

                                                )
                                            )}

                                        </select>


                                        <select
                                            value={
                                                assignmentForm.endPeriod
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setAssignmentForm(
                                                    current => ({
                                                        ...current,
                                                        endPeriod:
                                                            event
                                                                .target
                                                                .value
                                                    })
                                                )
                                            }
                                        >

                                            <option value="AM">
                                                AM
                                            </option>

                                            <option value="PM">
                                                PM
                                            </option>

                                        </select>

                                    </div>

                                </div>


                                {/* DAILY RENT */}

                                <div
                                    className=
                                        "assignment-field"
                                >

                                    <label>
                                        Daily Rent
                                    </label>


                                    <div
                                        className=
                                            "money-input"
                                    >

                                        <span>
                                            ₹
                                        </span>


                                        <input
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={
                                                assignmentForm.dailyRent
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setAssignmentForm(
                                                    current => ({
                                                        ...current,
                                                        dailyRent:
                                                            event
                                                                .target
                                                                .value
                                                    })
                                                )
                                            }
                                            placeholder="800"
                                            required
                                        />

                                    </div>

                                </div>


                                {/* DATE */}

                                <div
                                    className=
                                        "assignment-field"
                                >

                                    <label>
                                        Assignment Start Date
                                    </label>


                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength="10"
                                        placeholder=
                                            "DD/MM/YYYY"
                                        value={
                                            assignmentForm.startDate
                                        }
                                        onChange={(
                                            event
                                        ) => {

                                            let value =
                                                event.target.value
                                                    .replace(
                                                        /\D/g,
                                                        ""
                                                    )
                                                    .slice(
                                                        0,
                                                        8
                                                    );


                                            if (
                                                value.length >
                                                4
                                            ) {

                                                value =
                                                    `${value.slice(0, 2)}/` +
                                                    `${value.slice(2, 4)}/` +
                                                    `${value.slice(4)}`;

                                            } else if (
                                                value.length >
                                                2
                                            ) {

                                                value =
                                                    `${value.slice(0, 2)}/` +
                                                    `${value.slice(2)}`;

                                            }


                                            setAssignmentForm(
                                                current => ({
                                                    ...current,
                                                    startDate:
                                                        value
                                                })
                                            );

                                        }}
                                        required
                                    />


                                    <small
                                        className=
                                            "field-help"
                                    >
                                        Use DD/MM/YYYY. Example: 21/08/2026
                                    </small>

                                </div>


                                {/* REFERENCE NAME */}

                                <div
                                    className=
                                        "assignment-field"
                                >

                                    <label>
                                        Reference Person Name
                                    </label>


                                    <input
                                        type="text"
                                        value={
                                            assignmentForm.referenceName
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setAssignmentForm(
                                                current => ({
                                                    ...current,
                                                    referenceName:
                                                        event.target.value
                                                })
                                            )
                                        }
                                        placeholder=
                                            "e.g. Amit Shah"
                                        required
                                    />

                                </div>


                                {/* REFERENCE MOBILE */}

                                <div
                                    className=
                                        "assignment-field"
                                >

                                    <label>
                                        Reference Mobile Number
                                    </label>


                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        maxLength="10"
                                        value={
                                            assignmentForm.referenceMobile
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setAssignmentForm(
                                                current => ({
                                                    ...current,
                                                    referenceMobile:
                                                        event.target.value
                                                            .replace(
                                                                /\D/g,
                                                                ""
                                                            )
                                                            .slice(
                                                                0,
                                                                10
                                                            )
                                                })
                                            )
                                        }
                                        placeholder=
                                            "9876543210"
                                        required
                                    />

                                </div>

                            </div>


                            {/* ACTIONS */}

                            <div
                                className=
                                    "vehicle-modal-actions"
                            >

                                <button
                                    type="button"
                                    className=
                                        "vehicle-cancel-button"
                                    onClick={() =>
                                        setShowAssignModal(
                                            false
                                        )
                                    }
                                    disabled={
                                        assignLoading
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className=
                                        "vehicle-save-button"
                                    disabled={
                                        assignLoading ||
                                        !selectedDriver
                                    }
                                >
                                    {
                                        assignLoading
                                            ? "Assigning..."
                                            : "Assign Driver"
                                    }
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );

}


export default Vehicle;
