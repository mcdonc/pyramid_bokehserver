import os

from setuptools import setup, find_packages

here = os.path.abspath(os.path.dirname(__file__))

try:
    with open(os.path.join(here, 'README.txt')) as f:
        README = f.read()
except IOError:
    README = ''

try:
    with open(os.path.join(here, 'CHANGES.txt')) as f:
        CHANGES = f.read()
except IOError:
    CHANGES = ''

requires = [
    'pyramid',
    'pyramid_jinja2',
    'werkzeug',
    'bokeh',
    'tornado',
    ]

setup(name='pyramid_bokehserver',
      version='0.0',
      description='pyramid_bokehserver',
      long_description=README + '\n\n' + CHANGES,
      classifiers=[
        "Programming Language :: Python",
        "Framework :: Pyramid",
        "Topic :: Internet :: WWW/HTTP",
        "Topic :: Internet :: WWW/HTTP :: WSGI :: Application",
        ],
      author='',
      author_email='',
      url='',
      keywords='bokeh graph plot server',
      packages=find_packages(),
      include_package_data=True,
      zip_safe=False,
      install_requires=requires,
      tests_require=requires,
      test_suite="pyramid_bokehserver",
      entry_points="""\
      [paste.app_factory]
      main = pyramid_bokehserver:main
      [console_scripts]
      bokeh_server = pyramid_bokehserver.scripts:run_server
      """,
      )
