import { core, UX } from '@salesforce/command';
import * as assert from 'assert';
import Browserforce from '../src/browserforce';

describe('Browserforce', () => {
  describe('logged-out', function() {
    this.timeout(1000 * 300);
    this.slow(1000 * 30);
    describe('login()', () => {
      it('should successfully login with valid credentials', async function() {
        const defaultScratchOrg = await core.Org.create({});
        const ux = await UX.create();
        const bf = new Browserforce(defaultScratchOrg, ux.cli);
        await bf.login();
        await bf.logout();
        assert(true);
      });

      it('should fail login with invalid credentials', async function() {
        const fakeOrg = await core.Org.create({});
        fakeOrg.getConnection().accessToken = 'invalid';
        const ux = await UX.create();
        const bf = new Browserforce(fakeOrg, ux.cli);
        await assert.rejects(async () => {
          await bf.login();
        }, /login failed/);
        bf.logout();
      });
    });
  });
  describe('logged-in', function() {
    this.timeout(1000 * 300);
    this.slow(1000 * 30);
    before(async function() {
      const defaultScratchOrg = await core.Org.create({});
      const ux = await UX.create();
      this.bf = new Browserforce(defaultScratchOrg, ux.cli);
      await this.bf.login();
    });
    after(async function() {
      await this.bf.logout();
    });
    describe('getMyDomain()', () => {
      it('should determine a my domain for a scratch org', async function() {
        this.timeout(1000 * 300);
        this.slow(1000 * 30);
        const myDomain = this.bf.getMyDomain();
        assert.notDeepEqual(null, myDomain);
      });
    });
    describe('getInstanceDomain()', () => {
      it('should determine an instance domain for a scratch org with my domain', async function() {
        const instanceDomain = this.bf.getInstanceDomain();
        assert.notDeepEqual(null, instanceDomain);
      });
    });
    describe('getLightningUrl()', () => {
      it('should determine a LEX URL for a scratch org with my domain', async function() {
        const lexUrl = this.bf.getLightningUrl();
        assert.notDeepEqual(null, lexUrl);
      });
    });
    describe('throwPageErrors()', () => {
      it('should throw the page error on internal errors', async function() {
        process.env.BROWSERFORCE_RETRY_TIMEOUT_MS = '0';
        await assert.rejects(async () => {
          await this.bf.openPage(
            '_ui/common/config/field/StandardFieldAttributes/d?type=Account&id=INVALID_Name'
          );
        }, /Insufficient Privileges/);
        delete process.env.BROWSERFORCE_RETRY_TIMEOUT_MS;
      });
      it('should not throw any error opening a page', async function() {
        await this.bf.openPage(
          '_ui/common/config/field/StandardFieldAttributes/d?type=Account&id=Name'
        );
      });
    });
  });
});
