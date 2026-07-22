package com.eps.enterprise_procurement_system.advices;

import lombok.Data;

@Data
public class ApiResponse<T> {

     private T data;
     private ApiError error;

    public ApiResponse( ApiError apiError) {
        this();
        this.error = apiError;
    }

    public ApiResponse(T data){
        this();
        this.data = data;
    }


    public ApiResponse() {

    }
}
