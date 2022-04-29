+++
title = "DevPlatform - Internal Development Platform"
description = "How I built a fully automatic, scalable and secure development platform."
date = 2021-10-02

[taxonomies]
tags = ["product", "development"]
+++

![Screen Shot 2021-10-16 at 3.19.37 pm.png](Screen_Shot_2021-10-16_at_3.19.37_pm.png)

# Summary/Pitch

DevPlatform is a management and provisioning system for development environments run in the cloud. 

It can handle provisioning, customisation, and deprovisioning of environments in multiple GCP regions, including providing build commands and custom content to preload. 

Environments are accessible through a web URL and secured with [Cloudflare Access](https://www.cloudflare.com/teams/access/), enabling login via identity providers such as Microsoft (Azure AD) and Google.

# Development/design process

## Phase 1: Product design, audience, and needs assessment

DevPlatform was created as an internal tool for myself. While I develop many projects locally, some require advanced computing, storage, or networking capacity in the development stage that would be infeasible to provide locally. 

I needed a platform that could:

1. Emulate my local development platform, and operate at the same or higher speed.
2. Be more powerful than a local development platform, in terms of either network speed, CPU speed, storage or memory.
    1. **Storage and network speed** were identified as bottlenecks during local development and therefore prioritised for remote development.
3. Integrate with commonly used tools such as Git.
4. Be adjustable and configurable for various workloads.
5. Be cost-effective and scalable.
    1. Ideally, multiple cloud environments should be able to stay running or preserved in order to reduce developer friction. 

## Phase 2: Product research

This year especially has seen the improvement and popularisation of remote development platforms as a mainstream DevOps solution. Some products that already existed that fulfilled part of the requirements were:

- Github Codespaces - released August 2021.
    - Was adequate in speed, storage and networking requirements.
    - Had native integration with Git.
    - Was configurable (per-repository as well as per-user configuration for many aspects).
    - Was **not** cost-effective when scaled.
        - Codespaces was marketed and designed as a product that would fulfill the product requirements but it would have been unsustainable, due to the fact that pricing was prohibitive.
        

# Product showcase and usage flow

### Creating a new environment

![Square box with the title "Provision new platform". There is a form with a "Create" button below that has inputs, detailed to the right.](creating.png)

New development platforms can be created with varying startup configurations.

- **Platform ID** - Used in instance name and domain name: `dev-{id}.srg.id.au`
- **Repository to clone** - Any publicly available git repo can be cloned while the instance is starting up.
- **Zip URL** - Any `.zip` file can be specified to pull and extract while the instance is starting up.
- **GCP Zone** - Any GCP zone is available for provisioning (for proximity to data storage). 85 zones total.
- **Disk size** - Disk sizes from 10 to 375 gb can be specified.

### Managing existing environments

Any existing environment can be:

- **Accessed** - the URL of the environment is opened.
- **Deleted** - the environment is terminated.
- **Connected to (SSH)** - A SSH terminal opens in the browser.
- **Stopped** - the environment is stopped and may be started again.

![localhost_8000__local=1.png](localhost_8000__local1.png)

Information about the environment such as external IP, zone, machine type, machine status and disk size is easily visible.

(For example, this is an `e2-micro` instance with a 50GB disk that is currently running in the `australia-southeast2-a` zone with an external IP of [34.129.113.155](http://34.129.113.155).)

# Screenshots

## Sign-in and Authentication

Authentication is done via CloudFlare Access, so the screenshots below are of the Access login UI.

### Logging into the management console

![Screen Shot 2021-10-16 at 3.20.09 pm.png](Screen_Shot_2021-10-16_at_3.20.09_pm.png)

### Logging into an environment

![Screen Shot 2021-10-16 at 3.20.28 pm.png](Screen_Shot_2021-10-16_at_3.20.28_pm.png)

## Management console

### Listing running environments

![Screen Shot 2021-10-16 at 3.22.04 pm.png](Screen_Shot_2021-10-16_at_3.22.04_pm.png)

![Screen Shot 2021-10-16 at 3.19.37 pm.png](Screen_Shot_2021-10-16_at_3.19.37_pm.png)