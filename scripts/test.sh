#!/bin/sh
npm install
npm test -- --watchAll=false --passWithNoTests
