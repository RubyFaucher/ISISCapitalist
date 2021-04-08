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

    public Boolean deleteWorld(String username) {
        World oldWorld = getWorld(username);
        // recalculer nb anges a rajouter
        System.out.println("totalAngels: " + oldWorld.getTotalangels());
        System.out.println("score: " + oldWorld.getScore());

        double nbAngels = Math
                .floor(150 * Math.sqrt(oldWorld.getScore() / Math.pow(10, 15)) - oldWorld.getTotalangels());
        System.out.println("nbAngels: " + nbAngels);
        // récupérer totalangels et activeangles et score courant
        double totalAngels = oldWorld.getTotalangels();
        double activeAngels = oldWorld.getActiveangels();
        double score = oldWorld.getScore();
        // reset xml
        World newWorld = null;
        try {
            JAXBContext jaxbContext = JAXBContext.newInstance(World.class);
            Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
            InputStream input = getClass().getClassLoader().getResourceAsStream("world.xml");
            newWorld = (World) jaxbUnmarshaller.unmarshal(input);
        } catch (JAXBException ex) {
            System.out.println("Erreur lecture du fichier:" + ex.getMessage());
            ex.printStackTrace();
        }
        // dans le new xml, mettre totalangels+nbangels et activeangels+nbangels et
        // score
        newWorld.setTotalangels(totalAngels + nbAngels);
        newWorld.setActiveangels(activeAngels + nbAngels);
        newWorld.setScore(score);
        this.saveWorldToXml(username, newWorld);
        return true;

    }

    public Boolean updateProduct(String username, ProductType newproduct) {
        World world = getWorld(username);
        double money = world.getMoney();
        double newMoney;
        double newScore;

        ProductType product = findProductById(world, newproduct.getId());
        if (product == null) {
            return false;
        }
        int qteprod = product.getQuantite();
        int qtchange = newproduct.getQuantite() - qteprod;
        if (qtchange > 0) {
            if (qtchange == 1) {
                newMoney = money - (product.getCout());
                newScore = world.getScore() - product.getCout();
                product.setCout(product.getCout() * product.getCroissance());

            } else {
                newMoney = money - (product.getCout()
                        * ((1 - Math.pow(product.getCroissance(), qtchange)) / (1 - product.getCroissance())));
                newScore = world.getScore() - (product.getCout()
                        * ((1 - Math.pow(product.getCroissance(), qtchange)) / (1 - product.getCroissance())));

                product.setCout((product.getCout()
                        * ((1 - Math.pow(product.getCroissance(), qtchange)) / (1 - product.getCroissance()))));

            }
            newMoney = newMoney < 0 ? 0 : newMoney;
            world.setMoney(newMoney);
            world.setScore(newScore);
            product.setQuantite(qteprod + qtchange);
            for (PallierType unlock : product.getPalliers().getPallier()) {
                if ((product.getQuantite() >= unlock.getSeuil()) & (!unlock.isUnlocked())) {
                    unlock.setUnlocked(true);
                    switch (unlock.getTyperatio()) {
                    case VITESSE:
                        if (product.getTimeleft() > 0) {
                            product.setTimeleft(product.getTimeleft() / 2);
                        }
                        product.setVitesse((int) (product.getVitesse() / unlock.getRatio()));
                        break;
                    case GAIN:
                        product.setRevenu(product.getRevenu() * unlock.getRatio());
                        break;
                    }
                }
            }
        } else {

            product.setTimeleft(product.getVitesse());

        }

        saveWorldToXml(username, world);
        System.out.println("argent monde: " + world.getMoney());
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
        world.setScore(world.getScore() - manager.getSeuil());
        // sauvegarder les changements au monde
        saveWorldToXml(username, world);
        return true;
    }

    public boolean updateUpgrade(String username, PallierType newupgrade) {
        World world = getWorld(username);
        PallierType upgrade = findUpgradeByName(world, newupgrade.getName());
        if (upgrade == null) {
            return false;
        }
        // on vérifie si l'upgrade s'applique à tous les produits
        if (upgrade.getIdcible() != 0) {
            // trouver le produit correspondant a l'upgrade
            ProductType product = findProductById(world, upgrade.getIdcible());
            if (product == null) {
                return false;
            }
            // débloquer l'upgrade
            upgrade.setUnlocked(true);
            switch (upgrade.getTyperatio()) {
            case VITESSE:
                if (product.getTimeleft() > 0) {
                    product.setTimeleft(product.getTimeleft() / 2);
                }
                product.setVitesse((int) (product.getVitesse() / upgrade.getRatio()));
                break;
            case GAIN:
                product.setRevenu(product.getRevenu() * upgrade.getRatio());
                break;
            }

        } else {
            // débloquer l'upgrade
            upgrade.setUnlocked(true);
            for (ProductType produit : world.getProducts().getProduct()) {
                switch (upgrade.getTyperatio()) {
                case VITESSE:
                    if (produit.getTimeleft() > 0) {
                        produit.setTimeleft(produit.getTimeleft() / 2);
                    }
                    produit.setVitesse((int) (produit.getVitesse() / upgrade.getRatio()));
                    break;
                case GAIN:
                    produit.setRevenu(produit.getRevenu() * upgrade.getRatio());
                    break;
                }
            }
        }
        System.out.println("argent monde: " + world.getMoney());
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

    private PallierType findUpgradeByName(World world, String name) {
        PallierType upgrade = null;

        for (PallierType pallier : world.getAllunlocks().getPallier()) {
            if (pallier.getName().equals(name)) {
                upgrade = pallier;
            }

        }
        for (PallierType pallier : world.getUpgrades().getPallier()) {
            if (pallier.getName().equals(name)) {
                upgrade = pallier;
                double money = world.getMoney();
                world.setMoney(money - upgrade.getSeuil());
                world.setScore(world.getScore() - upgrade.getSeuil());

            }

        }

        return upgrade;
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
