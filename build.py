#!/usr/bin/python
# build and then copy in the various things we need to run the
# site.
#
# WARNING: this will trigger a build of both the backend and frontend. You can 
# surpress this behaviour with the --no-build flag.
#
# Optionally, you may pass the -t argument which will build a testing version,
# which will run the test version of the backend with random data, and will 
# build the testing version of the frontend code, rather than the production 
# minified code.
#
# Additionally, you may pass --tb to use the testing backend code, and --tf for
# the testing frontend code, as described above.
#
# There is also a verbose flag, for debugging

from plumbum import cli,local
from jinja2 import Template
import plumbum.path.utils 
import logging

class BuildRunDockerfile(cli.Application):
	build_backend = True
	build_frontend = True
	build_dockerfile = True

	test_backend = False
	test_dockerfile = False
	test_frontend = False
	verbose = True
	very_verbose = False

	upload_dockerimage = False

	@cli.switch('no-build', 
	            help='If given, do not do builds '\
                         'of the frontend or backend')
	def set_no_build(self):
		self.build_backend = False
		self.build_frontend = False
		self.build_dockerfile = False

	@cli.switch('nbb', 
	            help='Do not build the backend')
	def set_nobuild_backend(self):
		self.build_backend = False

	@cli.switch('nbf', 
	            help='Do not build the frontend')
	def set_nobuild_frontend(self):
		self.build_frontend = False

	@cli.switch('nbd', 
	            help='Do not build the dockerfile')
	def set_nobuild_dockerfile(self):
		self.build_dockerfile = False

	@cli.switch('t',
	            help='build testing versions of '\
	                 'both the frontend, backend and the dockerfile',
	            excludes=['--tb', '--tf', '--td'])
	def set_test(self):
		self.test_backend = True
		self.test_frontend = True
		self.test_dockerfile = True

	@cli.switch('tb',
	            help='use a test version of the backend',
	            excludes=['-t'])
	def set_test_backend(self):
		self.test_backend = True

	@cli.switch('tf',
	            help='use a test version of the frontend',
	            excludes=['-t'])
	def set_test_frontend(self):
		self.test_frontend = True

	@cli.switch('td',
	            help='use a test version of the dockerfile',
	            excludes=['-t'])
	def set_test_dockerfile(self):
		self.test_dockerfile = True

	@cli.switch('v',
	            help='print out debugging info')
	def set_verbose(self):
		self.verbose = True


	@cli.switch('vv',
	            help='print out more debugging info')
	def set_very_verbose(self):
		self.very_verbose = True

	@cli.switch('upload',
	            help='Upload image to docker repo')
	def set_upload_dockerimage(self):
		self.upload_dockerimage = True

	def main(self):
		self.print_plan()
		if not self.verbose and not self.very_verbose:
			logging.basicConfig(level=logging.WARNING)
		if self.verbose:
			logging.basicConfig(level=logging.INFO)
		if self.very_verbose:
			logging.basicConfig(level=logging.DEBUG)
		self.grab_frontend()
		self.grab_backend()
		self.build_dockerfile()
		self.build_image()
		self.upload_dockerimage()

	def print_plan(self):
		pass

	def upload_dockerimage(self, plan=False):
		if self.upload_dockerimage:
			if plan:
				return "Upload dockerimage does nothing"
		else:
			if plan:
				return ""

	def build_dockerfile(self, plan=False):
		if plan:
			if not self.build_dockerfile:
				return ""
			else:
				return "Building a new dockerfile, as %s" % \
					("test" if self.test_dockerfile else "production")
		if not self.build_dockerfile:
			return
		headerwarning = '''
##### DO NOT EDIT THIS FILE #####
# This is an autogenerated file. It will be overwriten 
# by the build system. Edit Dockerfile.jinja instead.
##### DO NOT EDIT THIS FILE #####
		'''
		with open('Dockerfile.jinja') as dockertemplate:
			docker_content = dockertemplate.read()
			template = Template(docker_content)
			docker_templated = template.render(
				deployment=not self.test_dockerfile, 
				headerwarning=headerwarning)
			with open('Dockerfile', 'w') as dockerfile:
				dockerfile.write(docker_templated)

	def build_image(self, plan=False):
		if plan:
			return "building docker image ririw/dist"
		docker_build = local['sudo']('docker', 'build', '-t', 'ririw/dist', '.')
		logging.info('Built the system: \n' + docker_build)
		#docker_run = local['sudo'].popen(args=['docker', 'run', '-i', '-t', '-p', '80:80', 'dist', '/bin/bash'])
		#while docker_run.poll():
			#print docker_run.communicate()

	def grab_backend(self, plan=False):
		if plan:
			if self.build_backend:
				return "Building backend and copying it to this dir"
			else:
				return "Copying backend to this dir (no build)"
		src = local.path('../backend/target/scala-2.10/'\
		                 'com.circusoc.backend-assembly-1.0.jar')
		dest = local.path('backend.jar')
		if self.build_backend:
			logging.info('testing & assembling the backend code')
			with local.cwd('../backend'):
				result = local['./activator']('assembly')
				logging.info('finished backend: \n' + result)
		plumbum.path.utils.copy(src, dest)

	def grab_frontend(self, plan=False):
		if plan:
			kind = "test" if self.test_frontend else "production"
			if self.build_backend:
				return "Building %s frontend and copying it to this dir" % kind
			else:
				return "Copying %s frontend to this dir (no build)" % kind

		'''Get all the frontend files'''
		src = local.path('../angular-material-frontend/build')
		dest = local.path('./frontend')

		if self.build_frontend:
			logging.info('cleaning the build dir')
			plumbum.path.utils.delete(src)
			gulp = local['../angular-material-frontend/'\
				     'node_modules/gulp/bin/gulp.js']
			with local.cwd('../angular-material-frontend/'):
				logging.info('Building the frontend code,'\
				             ' this can take a little while')
				if self.test_frontend:
					result = gulp('-t')
				else:
					result = gulp()
				logging.info('built the frontend: \n' + result)

		logging.info('copying the frontend files to where docker' \
		             'expects them to be.')
		plumbum.path.utils.delete(dest)
		plumbum.path.utils.copy(src, dest)

		

if __name__=='__main__':
	BuildRunDockerfile.run()
