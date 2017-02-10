module.exports = function (grunt) {
    grunt.initConfig({
        ts: {
            build: {
                tsconfig: true
            },
            options: {
                fast: 'never'
            }
        },
        copy: {
            flattents: {
                files: [
                    {
                        src: ['./tmp/**/*.js', 'tmp/**/*.js.map'],
                        dest: 'dist/',
                        flatten: true,
                        expand: true,
                        filter: "isFile"
                    }
                ]
            }
        },
        exec: {
            package_dev: {
                command: "tfx extension create --rev-version --manifests vss-extension.json",
                stdout: true,
                stderr: true
            },
            //package_release: {
            //    command: "tfx extension create --rev-version --manifests vss-extension.json",
            //    stdout: true,
            //    stderr:true
            //},
            publish_dev: {
                command: "tfx extension publish --service-url https://marketplace.visualstudio.com --rev-version --manifests vss-extension.json",
                stdout: true,
                stderr: true
            },
        },
        clean: {
            default: ["tmp", "dist/", "*.vsix", "build", "test"],
            tmp: ["tmp"],
        }
    });

    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks("grunt-exec");
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks("grunt-contrib-copy");

    grunt.registerTask("build", ["clean:default", "ts:build", "copy:flattents", "clean:tmp"]);

    grunt.registerTask("package-dev", ["build", "exec:package_dev"]);
    grunt.registerTask("publish-dev", ["package-dev", "exec:publish_dev"]);

    grunt.registerTask("default", ["package-dev"]);
};