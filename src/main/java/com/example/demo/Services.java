/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.example.demo;

import generated.PallierType;
import generated.ProductType;
import generated.World;

import java.io.File;
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

    // String path ="/Users/ruby/ISISCapitalist/src/main/resources";

    public World readWorldFromXml(String username) {

        JAXBContext jaxbContext;
        World world = null;
        try {
            jaxbContext = JAXBContext.newInstance(World.class);
            Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
            String fileName = username + "-world.xml";
            File worldFile = new File(fileName);
            if (!worldFile.exists()) {
                InputStream input = getClass().getClassLoader().getResourceAsStream("world.xml");
                world = (World) jaxbUnmarshaller.unmarshal(input);
            } else {
                world = (World) jaxbUnmarshaller.unmarshal(worldFile);
            }

        } catch (JAXBException ex) {
            System.out.println("Erreur lecture du fichier:" + ex.getMessage());
            ex.printStackTrace();
        }
        return world;
    }

    public void saveWorldToXml(String username, World world) {
        JAXBContext jaxbContext;

        try {

            jaxbContext = JAXBContext.newInstance(World.class);
            Marshaller march = jaxbContext.createMarshaller();
            String fileName = username + "-world.xml";
            OutputStream output = new FileOutputStream(fileName);
            march.marshal(world, output);
        } catch (Exception ex) {
            System.out.println("Erreur écriture du fichier:" + ex.getMessage());
            ex.printStackTrace();
        }
    }

    public World getWorld(String username) {
        World world = this.readWorldFromXml(username);
        this.updateScore(world);
        this.saveWorldToXml(username, world);
        return world;
    }

    public Boolean updateProduct(String username, ProductType newproduct) {
        World world = getWorld(username);
        double money = world.getMoney();
        ProductType product = findProductById(world, newproduct.getId());
        if (product == null) {
            return false;
        }
        int qteprod = product.getQuantite();
        int qtchange = newproduct.getQuantite() - qteprod;
        if (qtchange > 0) {
            // this.totalCost = x * ((1 - c ** n) / (1 - c));
            System.out.println("updating money");
            world.setMoney(money - (newproduct.getCout()
                    * ((1 - Math.pow(newproduct.getCroissance(), qtchange)) / (1 - newproduct.getCroissance()))));
            world.setScore(money - (newproduct.getCout()
                    * ((1 - Math.pow(newproduct.getCroissance(), qtchange)) / (1 - newproduct.getCroissance()))));
            // world.setMoney(money - (newproduct.getCout() * newproduct.getQuantite()));
            System.out.println("new money " + world.getMoney());
            product.setQuantite(qteprod + qtchange);
        } else {

            product.setTimeleft(product.getVitesse());

        }

        // this.updateScore(world);
        saveWorldToXml(username, world);
        return true;
    }

    public Boolean updateManager(String username, PallierType newmanager) {
        World world = getWorld(username);
        PallierType manager = findManagerByName(world, newmanager.getName());
        if (manager == null) {
            return false;
        }

        // trouver le produit correspondant au manager
        ProductType product = findProductById(world, manager.getIdcible());
        if (product == null) {
            return false;
        }
        // débloquer le manager de ce produit
        manager.setUnlocked(true);
        product.setManagerUnlocked(true);
        // soustraire de l'argent du joueur le cout du manager
        double money = world.getMoney();
        world.setMoney(money - manager.getSeuil());
        world.setScore(money - manager.getSeuil());
        // sauvegarder les changements au monde
        saveWorldToXml(username, world);
        return true;
    }

    private void updateScore(World world) {
        long tempsecoule = System.currentTimeMillis() - world.getLastupdate();
        for (ProductType product : world.getProducts().getProduct()) {
            if (!product.isManagerUnlocked()) {
                if (product.getTimeleft() != 0 && product.getTimeleft() < tempsecoule) {
                    world.setScore(world.getScore() + product.getRevenu());
                    world.setMoney(world.getMoney() + product.getRevenu());
                    product.setTimeleft(0);
                } else {
                    if ((product.getTimeleft() - tempsecoule) < 0) {
                        product.setTimeleft(0);
                    } else {

                        product.setTimeleft(product.getTimeleft() - tempsecoule);
                    }

                }
            } else {
                int qteproduite = (int) Math.floor(tempsecoule / product.getVitesse());
                world.setScore(world.getScore() + product.getRevenu() * qteproduite);
                world.setMoney(world.getMoney() + product.getRevenu() * qteproduite);
                if ((product.getTimeleft() - tempsecoule) < 0) {
                    product.setTimeleft(0);
                } else {
                    product.setTimeleft(product.getTimeleft() - tempsecoule);
                }
            }
        }
        world.setLastupdate(System.currentTimeMillis());

    }

    private PallierType findManagerByName(World world, String name) {
        PallierType manager = null;
        for (PallierType pallier : world.getManagers().getPallier()) {
            if (pallier.getName().equals(name)) {
                manager = pallier;
            }

        }
        return manager;
    }

    private ProductType findProductById(World world, int id) {
        ProductType produit = null;
        for (ProductType product : world.getProducts().getProduct()) {
            if (product.getId() == id) {
                produit = product;
            }
        }
        return produit;
    }

}
