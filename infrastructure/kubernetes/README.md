# Kubernetes config for the Digital Citizenship project

## What is this

This directory contains the configuration for deploying the backend components of the Digital Citizenship projects in the Kubernetes (K8S) cluster provisioned by Terraform.

## Prerequisites

  1. Install and setup `kubectl`
  1. Configure the K8S cluster credentials (on Azure you'll need `az acs` for legacy K8S or `az aks` for managed K8S).
  1. [Switch the context](https://kubernetes-v1-4.github.io/docs/user-guide/kubectl/kubectl_config_use-context/) for the environment you want to work on (e.g. test or production).

## Configuring resources

You'll probably first want to configure the ingress (`ingress.yml`) and then the rest of the resources (see comments in each file).
 