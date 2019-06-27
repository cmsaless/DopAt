module.exports = {

    sanitizeString: (str) => {
        str = str.replace(/[^a-z0-9 -]/gim,"");
        return str.trim();
    },
    
    classSort: (a, b) => {
        return a.name.localeCompare(b.name);
    },

    randomAttendanceCode: () => {
        var text = '';
        var possible = '0123456789';

        for (var i = 0; i < 5; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    },

    getUserOptions: (user) => {
        return {
            name: user.name,
            email: user.email,
            pro: user.pro,
            professor: user.professor
        };
    }

}