/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.example.demo;

import generated.World;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import javax.xml.bind.Unmarshaller;

/**
 *
 * @author ruby
 */


public class Services {
    
    World monde = new World();
    //String path ="/Users/ruby/ISISCapitalist/src/main/resources";  
    
    public World readWorldFromXml(String username){
       
        JAXBContext jaxbContext;

        try {
            jaxbContext = JAXBContext.newInstance(World.class);
            Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
            InputStream input=getClass().getClassLoader().getResourceAsStream(username+"-world.xml");
            if(input==null){
                input=getClass().getClassLoader().getResourceAsStream("world.xml");
            }
            monde = (World) jaxbUnmarshaller.unmarshal(input);
        } catch (JAXBException ex) {
            System.out.println("Erreur lecture du fichier:"+ex.getMessage());
            ex.printStackTrace();
        }
        
        return monde;
    }

    
    public void saveWorldToXml(World world, String username){
        JAXBContext jaxbContext;

        try {
            jaxbContext = JAXBContext.newInstance(World.class);
            Marshaller march = jaxbContext.createMarshaller();
            OutputStream output = new FileOutputStream(username+"-world.xml");
            march.marshal(monde, output);
        } catch (Exception ex) {
            System.out.println("Erreur écriture du fichier:"+ex.getMessage());
            ex.printStackTrace();
       }
    }
    
    
    public World getWorld(String username){
        return(this.readWorldFromXml(username));
    }
}
    

