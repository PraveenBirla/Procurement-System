package com.eps.enterprise_procurement_system.services;

import com.cloudinary.Cloudinary;
import com.eps.enterprise_procurement_system.config.CloudinaryConfig;
import org.apache.commons.collections4.MapUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
public class CloudinaryService {

        private final Cloudinary cloudinary;


    public CloudinaryService(  Cloudinary cloudinary) {
        this.cloudinary = cloudinary;

    }

    public String uploadFile(byte[] fileBytes, String fileName){
        try{
            Map uploadResult = cloudinary.uploader().upload(
                    fileBytes,
                    Map.of(
                            "resource_type", "raw",
                            "folder", "purchase_orders",
                            "public_id", fileName + ".pdf",
                            "use_filename", true
                    )
            );
            return uploadResult.get("secure_url").toString();
        }
        catch (Exception e){
            e.printStackTrace();
            throw new RuntimeException(e.getMessage(),e);
        }
    }

    public String uploadDocs(MultipartFile file) {

        try {

            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    Map.of(
                            "resource_type", "auto",
                            "folder", "supplier_documents",
                            "public_id", file.getOriginalFilename(),
                            "use_filename", true,
                            "overwrite", true
                    )
            );

            return uploadResult.get("secure_url").toString();

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to upload document", e);
        }
    }
}
