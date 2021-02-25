/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.example.demo;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.springframework.web.bind.annotation.RequestBody;

import generated.PallierType;
import generated.ProductType;

/**
 *
 * @author ruby
 */
@Path("generic")
public class Webservice {

    Services services;

    public Webservice() {
        services = new Services();
    }

    @GET
    @Path("world")
    @Produces({ MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON })
    public Response getWorld(@Context HttpServletRequest request) {
        String username = request.getHeader("X-user");
        return Response.ok(services.getWorld(username)).build();
    }

    @PUT
    @Path("product")
    public Response updateProduct(@Context HttpServletRequest request, @RequestBody ProductType product) {
        String username = request.getHeader("X-user");
        System.out.print("Updating " + product.getName());
        System.out.println(" With a revenue of " + product.getRevenu());
        return Response.ok(services.updateProduct(username, product)).build();
    }

    @PUT
    @Path("manager")
    public Response updateManager(@Context HttpServletRequest request, @RequestBody PallierType pallier) {
        String username = request.getHeader("X-user");
        System.out.println("Updating " + pallier.getName());
        if (services.updateManager(username, pallier)) {
            return Response.ok().build();
        } else {
            return Response.status(400).build();
        }
    }
}
