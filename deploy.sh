#!/usr/bin/expect -f
spawn ssh $MYSSHUSER@$MYSSHHOST
expect "password:"
sleep 1
send "$MYSSHPASS\r"
date > test.txt