const express = require("express");
const router  = express.Router();

const { protect }  = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { uploadProfilePicture } = require("../middleware/uploadMiddleware");
const uploadErrorHandler       = require("../middleware/uploadErrorHandler");
const { updateProfileValidator, changePasswordValidator } = require("../validators/profileValidators");
const {
  getMyProfile,
  updateMyProfile,
  changePassword,
  getMyProfileSummary,
  updateProfilePicture,
} = require("../controllers/profileController");

router.use(protect);

router.get("/me",      getMyProfile);
router.put("/me",      updateProfileValidator, validateRequest, updateMyProfile);
router.put("/change-password", changePasswordValidator, validateRequest, changePassword);
router.get("/summary", getMyProfileSummary);
router.put(
  "/profile-picture",
  uploadProfilePicture.single("profileImage"),
  uploadErrorHandler,
  updateProfilePicture
);

module.exports = router;
