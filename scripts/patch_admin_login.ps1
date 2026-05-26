$path = 'c:\laragon\www\TaskflowMobile\app\login.tsx'
$text = Get-Content -Raw -Path $path
$old = @'
      console.log('Login réussi', { user: minimalUser, token: cleanToken });

      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Erreur de connexion', error.response?.data || error.message);
'@
$new = @'
      console.log('Login réussi', { user: minimalUser, token: cleanToken });

      if (minimalUser.isAdmin) {
        router.replace('/admin');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.error('Erreur de connexion', error.response?.data || error.message);
'@
if ($text -notlike "*$old*") {
    Write-Host 'OLD_NOT_FOUND'
    exit 1
}
$text = $text.Replace($old, $new)
Set-Content -Path $path -Value $text
Write-Host 'UPDATED'
