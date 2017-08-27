#!/bin/bash
rsync -arvuz --progress --chmod=ug=rwX,o=rX . daniel@dan.cx:/var/www/dnstools.ws/
