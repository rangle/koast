function hashPassword(password) {

  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) {
      console.error('Could not generate salt:', err);
    }

    // hash the password using our new salt
    bcrypt.hash(password, salt, function (err, hash) {
      if (err) {
        console.error('Could not hash password:', err);
      } else {
        console.log(hash);
      }
    });
  });
}

hashPassword('x');