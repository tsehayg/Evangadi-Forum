async function register(req, res) {
  const { username, firstname, lastname, email, password } = req.body;

  if (!username || !firstname || !lastname || !email || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "All fields are required" });
  }

  if (password.length < 8) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Password must be at least 8 characters long" });
  }

  try {
    // Check if username or email already exists
    const [rows] = await dbCon.query(
      "SELECT username, userid FROM usersTable WHERE username=? OR email=?",
      [username, email]
    );

    if (rows.length > 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Username or email already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    await dbCon.query(
      "INSERT INTO usersTable (username, firstName, lastName, email, password) VALUES (?, ?, ?, ?, ?)",
      [username, firstname, lastname, email, hashedPassword]
    );

    return res
      .status(StatusCodes.CREATED)
      .json({ msg: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong, please try again later!" });
  }
}
