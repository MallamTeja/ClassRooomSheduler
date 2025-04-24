module.exports.loginPost = async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // Replace with actual admin validation
        if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
            req.session.adminLoggedIn = true;
            req.session.admin = { username };
            return res.redirect('/admin/dashboard');
        }
        
        res.render('login', {
            error: 'Invalid credentials',
            username
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('error');
    }
};

module.exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) console.error(err);
        res.redirect('/login');
    });
};