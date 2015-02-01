This is where we set up a docker instance for the site.

How to use
==========
Call build.sh
This builds a docker instance.

Then push it:

    docker push ririw/dist

Then create a coreos box, and upload circus.service

Then, ssh in and run:
    
    fleetctl submit circus.service
    fleetctl start circus.service

You may monitor it with 

    fleetctl status circus.service

Config
======
Change the various config files to set things to your liking.


Test mode
=========
You can build in test mode with the "-t" flag. With this, you 
can run the system localy, with

    docker run -t -i -p 80:80 ririw/dist /root/run.sh
