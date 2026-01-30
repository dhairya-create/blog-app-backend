import { v2 as cloudinary } from "cloudinary";

// Cloudinary auto-reads CLOUDINARY_URL
cloudinary.config({
  secure: true,
});

export default cloudinary;
