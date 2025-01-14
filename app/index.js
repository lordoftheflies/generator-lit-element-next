const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const ghUser = require('gh-user');
const pkgJson = require('../package.json');

module.exports = class extends Generator {
  initializing() {
    try {
      const ghTask = this.user.github.username()
        .then(un => Promise.all([un, ghUser(un)]))
        .then(([un, info]) => {
          return [un, info.html_url];
        })
        .catch(() => []);

      return ghTask.then(([ username, homepage ]) => {
        this.user.info = {
          name: this.user.git.name(),
          email: this.user.git.email(),
          username,
          homepage,
        };
      });
    } catch (_) {
      this.user.info = {
        name: this.user.git.name() || '',
        email: this.user.git.email() || '',
        username: '',
        homepage: '',
      };
    }
  }

  prompting() {
    this.log(yosay(`Welcome to the stunning ${chalk.red(pkgJson.name)}!`));

    const fallbackDescription =
      'A simple custom element written in TypeScript with LitElement';
    const prompts = [
      {
        type: 'input',
        name: 'packageName',
        message: 'What would you like your project to be named?',
        default: () => {
          return process.cwd().replace(/(?:.*[/\\])([^/\\]+?)[/\\]*?$/gi, '$1');
        },
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description',
      },
      {
        type: 'input',
        name: 'homepage',
        message: 'Homepage URL',
      },
      {
        type: 'input',
        name: 'repoUrl',
        message: 'Link to the repository',
      },
      {
        type: 'input',
        name: 'authorName',
        message: 'Author\'s Name',
        default: this.user.info.name,
      },
      {
        type: 'input',
        name: 'authorEmail',
        message: 'Author\'s email',
        default: this.user.info.email,
      },
      {
        type: 'input',
        name: 'authorUrl',
        message: 'Author\'s homepage',
        default: this.user.info.homepage,
      },
      {
        type: 'input',
        name: 'gitName',
        message: 'Github username or organization',
        default: this.user.info.username,
      },
    ];

    return this.prompt(prompts).then((props) => {
      this.props = Object.assign({}, props, {
        docDescription: (props.description || fallbackDescription).replace(
          /typeScript/i, '[TypeScript][typescript-url]'),
      });
    });
  }

  writing() {
    const NON_TPLS = [
      'src/my-element.ts',
      'src/test/my-element.spec.ts',
      'src/test/test-helpers.ts',
      'src/test/index.html',
      'src/test/runner.html',
      'tsconfig.prod.json',
      'tsconfig.json',
      'tslint.json',
      'tslint.prod.json',
      'wct.config.json',
    ];
    const TPLS = [
      '_.editorconfig',
      '_.gitattributes',
      '_.gitignore',
      '_.npmrc',
      '_LICENSE',
      '_package.json',
      '_README.md',
    ];

    NON_TPLS.map((n) => {
      return this.fs.copy(
        this.templatePath(n),
        this.destinationPath(n),
        this.props);
    });

    TPLS.map((n) => {
      return this.fs.copyTpl(
        this.templatePath(n),
        this.destinationPath(n.replace(/(_)/gi, '')),
        this.props);
    });
  }

  install() {
    this.installDependencies({
      bower: false,
      npm: true,
    });
  }
};
