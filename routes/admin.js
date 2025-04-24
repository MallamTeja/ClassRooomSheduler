// Admin middleware
const adminAuth = (req, res, next) => {
    if (!req.session.adminLoggedIn) {
        return res.redirect('/login');
    }
    next();
};

// Dashboard Route
module.exports.dashboard = (req, res) => {
    res.render('dashboard', {
        pageTitle: 'Admin Dashboard',
        user: req.session.admin
    });
};

// Faculty Management Routes
module.exports.faculty = {
    list: async (req, res) => {
        try {
            const faculty = await Faculty.find();
            res.render('facultyView', { faculty });
        } catch (err) {
            console.error(err);
            res.status(500).render('error');
        }
    },
    
    create: async (req, res) => {
        try {
            const newFaculty = new Faculty(req.body);
            await newFaculty.save();
            res.redirect('/admin/faculty');
        } catch (err) {
            console.error(err);
            res.status(500).render('error');
        }
    }
};

// Timetable Generation Route
module.exports.generateTimetable = async (req, res) => {
    try {
        const constraints = {
            faculty: await Faculty.find(),
            classrooms: await Classroom.find(),
            subjects: await Subject.find()
        };
        
        // Placeholder for scheduling algorithm
        const generatedTimetable = await generateSchedule(constraints);
        
        res.render('timetable', {
            timetable: generatedTimetable,
            downloadLink: `/timetable/export/${generatedTimetable._id}`
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('error');
    }
};